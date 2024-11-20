# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.3.1](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.3.0...v0.3.1) (2024-11-20)


### Bug Fixes

* correct missed change to function on module instead of method on object ([9b506f8](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9b506f86d8f25ef2735e475ecfd286256f3e81b3))
* dev server now handles add & removing files where previously it ignored the events ([4e7fc46](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/4e7fc46d95326ceb2f8430fe3f4e2c4ae3845471))

## [0.3.0](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.7...v0.3.0) (2024-11-20)


### ⚠ BREAKING CHANGES

* import sibling files of same name into resulting html (#7)

### Features

* import sibling files of same name into resulting html ([#7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/issues/7)) ([0ed4982](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/0ed4982c2073a3b82253bf2d54fcf08d6935fb0a))

## [0.2.7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.6...v0.2.7) (2024-11-20)


### Bug Fixes

* **frontmatter:** add page data to document in build ([02829d7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/02829d701fd4440b1f4d7a899093ec180633d49e))

## [0.2.6](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.5...v0.2.6) (2024-11-20)


### Features

* frontmatter data populates head elements ([#6](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/issues/6)) ([a797c75](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/a797c757c3dc0553dd588bdb5483d7638731ba0d))

## [0.2.5](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.4...v0.2.5) (2024-11-15)


### Features

* make it possible to only specify a build exclusion ([71f83e7](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/71f83e791bb2724935e4a5b8facd86e601e25efe))

## [0.2.4](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.3...v0.2.4) (2024-11-14)


### Features

* index.html in root no longer necessary ([e3912bd](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/e3912bd5e2899835061a913f9c26dbc00e811ad3))


### Bug Fixes

* correct type of ExcludePatterns to allow single strings ([9f6a344](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9f6a34420fe3fd3d35dc75deff44433c081042a0))

## [0.2.3](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/compare/v0.2.2...v0.2.3) (2024-11-14)


### Bug Fixes

* excludes is now optional ([d451be4](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/d451be44c24f88b962293bfa8e5386842c16830c))
* options object now optional ([9af3000](https://github.com/andrew-chang-dewitt/vite-plugin-static-md/commit/9af3000a99946e1ba3e8d1b555758030cb816c34))

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
