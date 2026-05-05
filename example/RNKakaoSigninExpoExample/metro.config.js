const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

const escape = p => p.replace(/[/\\]/g, '[/\\\\]');

config.watchFolders = [packageRoot];
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
config.resolver.extraNodeModules = {
  '@package-kr/react-native-kakao-signin': packageRoot,
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};
config.resolver.blockList = [
  new RegExp(
    escape(path.resolve(packageRoot, 'example')) +
      '[/\\\\](?!RNKakaoSigninExpoExample(?:[/\\\\]|$)).*'
  ),
  new RegExp(escape(path.resolve(packageRoot, 'node_modules')) + '[/\\\\].*'),
];

module.exports = config;
