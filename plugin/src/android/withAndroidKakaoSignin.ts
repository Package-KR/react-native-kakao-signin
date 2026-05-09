import {
  AndroidConfig,
  type ConfigPlugin,
  withAndroidManifest,
  withStringsXml,
  withProjectBuildGradle,
  withGradleProperties,
  withSettingsGradle,
} from '@expo/config-plugins';
import type { ManifestActivity } from '@expo/config-plugins/build/android/Manifest';
import type { KakaoSigninPluginProps } from '..';

// Android 설정 상수
const ACTIVITY_NAME = 'com.kakao.sdk.auth.AuthCodeHandlerActivity';
const KAKAO_MAVEN_URL = 'https://devrepo.kakao.com/nexus/content/groups/public/';
const KAKAO_MAVEN_REPOSITORY = `maven { url '${KAKAO_MAVEN_URL}' }`;
const EXTRA_MAVEN_REPOS_PROPERTY = 'android.extraMavenRepos';
const KAKAO_EXTRA_MAVEN_REPOS = JSON.stringify([{ url: KAKAO_MAVEN_URL }]);
const KAKAO_VERSION_MARKER_START = '// @package-kr/react-native-kakao-signin kakaoSdkVersion start';
const KAKAO_VERSION_MARKER_END = '// @package-kr/react-native-kakao-signin kakaoSdkVersion end';
const KAKAO_VERSION_MARKER_REGEX =
  /\s*\/\/ @package-kr\/react-native-kakao-signin kakaoSdkVersion start\r?\n\s*kakaoSdkVersion\s*=\s*["'][^"']*["']\r?\n\s*\/\/ @package-kr\/react-native-kakao-signin kakaoSdkVersion end\r?\n?/m;

// 카카오 URL scheme 해석
const resolveKakaoScheme = (props: KakaoSigninPluginProps): string =>
  props.kakaoAppScheme ?? `kakao${props.kakaoAppKey}`;

// 카카오 OAuth redirect intent-filter 생성
const createKakaoIntentFilter = (kakaoScheme: string) => ({
  action: [
    {
      $: { 'android:name': 'android.intent.action.VIEW' },
    },
  ],
  category: [
    { $: { 'android:name': 'android.intent.category.DEFAULT' } },
    { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
  ],
  data: [
    {
      $: {
        'android:host': 'oauth',
        'android:scheme': kakaoScheme,
      },
    },
  ],
});

// OAuth redirect intent-filter action 확인
const hasExpectedAction = (intentFilter: NonNullable<ManifestActivity['intent-filter']>[number]) =>
  intentFilter.action?.some(action => action.$['android:name'] === 'android.intent.action.VIEW') ?? false;

// OAuth redirect intent-filter category 확인
const hasExpectedCategories = (intentFilter: NonNullable<ManifestActivity['intent-filter']>[number]) => {
  const categories = intentFilter.category?.map(category => category.$['android:name']) ?? [];
  return (
    categories.includes('android.intent.category.DEFAULT') && categories.includes('android.intent.category.BROWSABLE')
  );
};

// 카카오 OAuth redirect intent-filter 판정
const isOAuthRedirectIntentFilter = (intentFilter: NonNullable<ManifestActivity['intent-filter']>[number]) =>
  hasExpectedAction(intentFilter) &&
  hasExpectedCategories(intentFilter) &&
  (intentFilter.data?.some(data => data.$['android:host'] === 'oauth') ?? false);

// 지정한 scheme의 카카오 OAuth redirect intent-filter 판정
const isOAuthRedirectIntentFilterForScheme = (
  intentFilter: NonNullable<ManifestActivity['intent-filter']>[number],
  kakaoScheme: string,
) =>
  isOAuthRedirectIntentFilter(intentFilter) &&
  (intentFilter.data?.some(
    data => data.$['android:host'] === 'oauth' && data.$['android:scheme']?.toLowerCase() === kakaoScheme.toLowerCase(),
  ) ??
    false);

/**
 * AndroidManifest.xml에 AuthCodeHandlerActivity 추가
 * 카카오톡 로그인 후 앱으로 돌아오기 위한 OAuth redirect intent-filter를 병합한다
 */
const modifyAndroidManifest: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return withAndroidManifest(config, config => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    const kakaoScheme = resolveKakaoScheme(props);
    const activities = (mainApplication.activity ??= []);

    const kakaoActivity: ManifestActivity = {
      $: {
        'android:name': ACTIVITY_NAME,
        'android:exported': 'true',
      },
      'intent-filter': [createKakaoIntentFilter(kakaoScheme)],
    };

    const activity = activities.find(activity => activity.$['android:name'] === ACTIVITY_NAME);

    if (!activity) {
      activities.push(kakaoActivity);
    } else {
      const intentFilters = activity['intent-filter'] ?? [];

      activity.$ = {
        ...activity.$,
        'android:name': ACTIVITY_NAME,
        'android:exported': 'true',
      };

      const nonTargetIntentFilters = intentFilters.filter(
        intentFilter => !isOAuthRedirectIntentFilterForScheme(intentFilter, kakaoScheme),
      );

      activity['intent-filter'] = [...nonTargetIntentFilters, createKakaoIntentFilter(kakaoScheme)];
    }

    return config;
  });
};

// strings.xml에 Kakao 앱 키와 URL scheme 추가
const modifyStringsXml: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return withStringsXml(config, config => {
    AndroidConfig.Strings.setStringItem([{ $: { name: 'kakao_app_key' }, _: props.kakaoAppKey }], config.modResults);
    AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'kakao_custom_scheme' }, _: resolveKakaoScheme(props) }],
      config.modResults,
    );

    return config;
  });
};

// settings.gradle에 Kakao Maven 저장소 추가
const modifySettingsGradle: ConfigPlugin<KakaoSigninPluginProps> = config => {
  return withSettingsGradle(config, config => {
    config.modResults.contents = ensureKakaoMavenRepositoryInSettings(config.modResults.contents);
    return config;
  });
};

// Expo/AGP가 읽는 extra Maven 저장소 속성 추가
const modifyGradleProperties: ConfigPlugin<KakaoSigninPluginProps> = config => {
  return withGradleProperties(config, config => {
    const existingProperty = config.modResults.find(
      item => item.type === 'property' && item.key === EXTRA_MAVEN_REPOS_PROPERTY,
    );

    if (existingProperty?.type === 'property') {
      existingProperty.value = mergeKakaoMavenRepoProperty(existingProperty.value);
    } else {
      config.modResults.push({
        type: 'property',
        key: EXTRA_MAVEN_REPOS_PROPERTY,
        value: KAKAO_EXTRA_MAVEN_REPOS,
      });
    }

    return config;
  });
};

/**
 * build.gradle의 kakaoSdkVersion ext 속성을 정규화한다
 * overrideKakaoSDKVersion을 제거하면 기존 플러그인 주입 값도 제거한다
 */
const modifyProjectBuildGradle: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return withProjectBuildGradle(config, config => {
    const cleanedContents = config.modResults.contents.replace(KAKAO_VERSION_MARKER_REGEX, '');

    if (!props.overrideKakaoSDKVersion) {
      config.modResults.contents = cleanedContents;
      return config;
    }

    const extProperty = [
      KAKAO_VERSION_MARKER_START,
      `kakaoSdkVersion = "${props.overrideKakaoSDKVersion}"`,
      KAKAO_VERSION_MARKER_END,
    ].join('\n');
    config.modResults.contents = insertKakaoSdkVersionIntoBuildscript(cleanedContents, extProperty);
    return config;
  });
};

// dependencyResolutionManagement 블록에 Kakao Maven 저장소 병합
const ensureKakaoMavenRepositoryInSettings = (contents: string): string => {
  if (contents.includes(KAKAO_MAVEN_URL) || !contents.includes('dependencyResolutionManagement')) {
    return contents;
  }

  if (/dependencyResolutionManagement\s*\{[\s\S]*?repositories\s*\{/.test(contents)) {
    return contents.replace(
      /(dependencyResolutionManagement\s*\{[\s\S]*?repositories\s*\{)/,
      `$1\n    ${KAKAO_MAVEN_REPOSITORY}`,
    );
  }

  return contents.replace(
    /dependencyResolutionManagement\s*\{/,
    match => `${match}\n  repositories {\n    ${KAKAO_MAVEN_REPOSITORY}\n  }`,
  );
};

// android.extraMavenRepos JSON 값에 Kakao Maven 저장소 병합
const mergeKakaoMavenRepoProperty = (value: string): string => {
  try {
    const repositories = JSON.parse(value);

    if (Array.isArray(repositories)) {
      const hasKakaoRepository = repositories.some(repository => repository?.url === KAKAO_MAVEN_URL);
      return hasKakaoRepository ? value : JSON.stringify([...repositories, { url: KAKAO_MAVEN_URL }]);
    }
  } catch {}

  return KAKAO_EXTRA_MAVEN_REPOS;
};

// buildscript.ext 블록에 Kakao SDK 버전 변수 삽입
const insertKakaoSdkVersionIntoBuildscript = (contents: string, extProperty: string): string => {
  if (!/buildscript\s*\{/.test(contents)) {
    return `buildscript {\n    ext {\n        ${extProperty}\n    }\n}\n\n${contents}`;
  }

  if (!/buildscript\s*\{[\s\S]*?ext\s*\{/.test(contents)) {
    return contents.replace(/buildscript\s*\{/, match => `${match}\n    ext {\n        ${extProperty}\n    }`);
  }

  return contents.replace(/(buildscript\s*\{[\s\S]*?ext\s*\{)/, `$1\n        ${extProperty}`);
};

// Android 설정 적용
export const withAndroidKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return [
    modifySettingsGradle,
    modifyGradleProperties,
    modifyAndroidManifest,
    modifyStringsXml,
    modifyProjectBuildGradle,
  ].reduce((nextConfig, plugin) => plugin(nextConfig, props), config);
};
