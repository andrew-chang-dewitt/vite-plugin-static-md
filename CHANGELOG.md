# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.2.2](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.1...v0.2.2) (2024-11-13)


### Features

* add excludes option for excluding files ([d6aaf99](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/d6aaf99e4ce01c7c9dfab8094e1928ca893512eb))

## [0.2.1](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.0...v0.2.1) (2024-11-13)


### Bug Fixes

* include logger customization on build & ensure setting info level if user supplied ([15935fb](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/15935fb83448fc4653c9d6d219de3ebf7a4db18a))

## [0.2.0](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.1.3...v0.2.0) (2024-11-13)


### Features

* default to warn logs only & allow user to customize log level ([3bddc86](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/3bddc86c4a6c9d5d2ba3b229113b7e9a42b8ed51))


### Bug Fixes

* stop adding duplicate leading slash on root level markdown imports ([e7048ad](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/e7048ada7a749573ea4354dbb3566000c2c7e51e))
* use js import extension per esm ([9b6d94f](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9b6d94ff74002c4626ebec3810370b5fc0f5f7c4))

## [0.1.3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.1.2...v0.1.3) (2024-11-12)


### Bug Fixes

* first-level subpages defined in markdown resolve id correctly ([34199fa](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/34199fa0f260ba83cc353e1127003b2bb8a192f4))
* prepublish hook now calls build script correctly ([2be402b](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/2be402ba51c61fa8e1519e6c8503cd6bbbb74952))
