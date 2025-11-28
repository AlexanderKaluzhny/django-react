// PostCSS configuration
// Matches the webpack postcss-loader configuration from webpack.config.js

module.exports = {
  plugins: [
    // Fix flexbox bugs
    // https://github.com/luisrudge/postcss-flexbugs-fixes
    require('postcss-flexbugs-fixes'),

    // PostCSS Preset Env with autoprefixer
    // Matches webpack configuration (lines 125-133)
    require('postcss-preset-env')({
      // Autoprefixer options
      autoprefixer: {
        // Disable old flexbox spec (2009)
        flexbox: 'no-2009',
      },
      // Stage 3 features (default)
      stage: 3,
    }),

    // PostCSS Normalize - CSS reset based on browserslist
    // Honors browserslist config in package.json
    require('postcss-normalize')(),
  ],
};
