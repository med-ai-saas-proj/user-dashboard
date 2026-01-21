const lintStagedConfig = {
  "*.{js,ts,jsx,tsx,css,json}": [
    "biome format --write --no-errors-on-unmatched",
    "biome lint --write --no-errors-on-unmatched",
  ],
};

export default lintStagedConfig;
