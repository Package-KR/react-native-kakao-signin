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

const ACTIVITY_NAME = 'com.kakao.sdk.auth.AuthCodeHandlerActivity';
const KAKAO_MAVEN_URL = 'https://devrepo.kakao.com/nexus/content/groups/public/';
const KAKAO_MAVEN_REPOSITORY = `maven { url '${KAKAO_MAVEN_URL}' }`;
const EXTRA_MAVEN_REPOS_PROPERTY = 'android.extraMavenRepos';
const KAKAO_EXTRA_MAVEN_REPOS = JSON.stringify([{ url: KAKAO_MAVEN_URL }]);
const KAKAO_VERSION_MARKER_START = '// @package-kr/react-native-kakao-signin kakaoSdkVersion start';
const KAKAO_VERSION_MARKER_END = '// @package-kr/react-native-kakao-signin kakaoSdkVersion end';
const KAKAO_VERSION_MARKER_REGEX =
  /\s*\/\/ @package-kr\/react-native-kakao-signin kakaoSdkVersion start\r?\n\s*kakaoSdkVersion\s*=\s*["'][^"']*["']\r?\n\s*\/\/ @package-kr\/react-native-kakao-signin kakaoSdkVersion end\r?\n?/m;

const resolveKakaoScheme = (props: KakaoSigninPluginProps): string =>
  props.kakaoAppScheme ?? `kakao${props.kakaoAppKey}`;

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

const hasExpectedAction = (intentFilter: NonNullable<ManifestActivity['intent-filter']>[number]) =>
  intentFilter.action?.some(action => action.$['android:name'] === 'android.intent.action.VIEW') ?? false;

const hasExpectedCategories = (intentFilter: NonNullable<ManifestActivity['intent-filter']>[number]) => {
  const categories = intentFilter.category?.map(category => category.$['android:name']) ?? [];
  return (
    categories.includes('android.intent.category.DEFAULT') && categories.includes('android.intent.category.BROWSABLE')
  );
};

const isOAuthRedirectIntentFilter = (intentFilter: NonNullable<ManifestActivity['intent-filter']>[number]) =>
  hasExpectedAction(intentFilter) &&
  hasExpectedCategories(intentFilter) &&
  (intentFilter.data?.some(data => data.$['android:host'] === 'oauth') ?? false);

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
 * 카카오톡 로그인 후 앱으로 돌아오기 위한 리다이렉트 설정
 */
const modifyAndroidManifest: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  return withAndroidManifest(config, config => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    const kakaoScheme = resolveKakaoScheme(props);

    const kakaoActivity: ManifestActivity = {
      $: {
        'android:name': ACTIVITY_NAME,
        'android:exported': 'true',
      },
      'intent-filter': [createKakaoIntentFilter(kakaoScheme)],
    };

    if (!mainApplication.activity) {
      mainApplication.activity = [];
    }

    // 기존 카카오 액티비티가 있으면 보존하고 필요한 intent-filter만 병합
    const existingIndex = mainApplication.activity.findIndex(activity => activity.$['android:name'] === ACTIVITY_NAME);

    if (existingIndex < 0) {
      mainApplication.activity.push(kakaoActivity);
    } else {
      const activity = mainApplication.activity[existingIndex];
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

/**
 * strings.xml에 kakao_app_key 추가
 */
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

const modifySettingsGradle: ConfigPlugin<KakaoSigninPluginProps> = config => {
  return withSettingsGradle(config, config => {
    config.modResults.contents = ensureKakaoMavenRepositoryInSettings(config.modResults.contents);
    return config;
  });
};

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

const insertKakaoSdkVersionIntoBuildscript = (contents: string, extProperty: string): string => {
  if (!/buildscript\s*\{/.test(contents)) {
    return `buildscript {\n    ext {\n        ${extProperty}\n    }\n}\n\n${contents}`;
  }

  if (!/buildscript\s*\{[\s\S]*?ext\s*\{/.test(contents)) {
    return contents.replace(/buildscript\s*\{/, match => `${match}\n    ext {\n        ${extProperty}\n    }`);
  }

  return contents.replace(/(buildscript\s*\{[\s\S]*?ext\s*\{)/, `$1\n        ${extProperty}`);
};

export const withAndroidKakaoSignin: ConfigPlugin<KakaoSigninPluginProps> = (config, props) => {
  config = modifySettingsGradle(config, props);
  config = modifyGradleProperties(config, props);
  config = modifyAndroidManifest(config, props);
  config = modifyStringsXml(config, props);
  config = modifyProjectBuildGradle(config, props);

  return config;
};
