"use strict";

module.exports = {
  plugins: ["typescript", "scss"], // Asegúrate de que estos plugins estén instalados y configurados correctamente.
  
  // Puedes eliminar setFdLimit si no estás llamando al método correctamente.
  // Si necesitas establecer el límite de descriptores de archivos (file descriptor limit), deberías hacerlo en el entorno de tu shell o en el script que inicia tu aplicación Node.js.
  // setFdLimit: 1000, // Esta línea parece estar fuera de lugar, asegúrate de que es relevante para tu configuración y si necesitas usarla, colócala donde corresponda.

  options: {
    buildType: "iso", // Asegúrate de que 'iso' es un tipo de construcción válido en tu configuración de Razzle.
  },
  
  modifyWebpackConfig({
    env: {
      target, // 'node' o 'web'
      dev, // true o false
    },
    webpackConfig, // la configuración de webpack creada
    webpackObject, // el módulo de webpack importado
    options: {
      pluginOptions, // las opciones pasadas a los plugins
      razzleOptions, // las opciones modificadas pasadas a Razzle
      webpackOptions, // las opciones utilizadas para configurar webpack, loaders y plugins
    },
    paths, // las rutas modificadas que usará Razzle.
  }) {
    // Ejemplo de cómo modificar opciones de watch para webpack
    webpackConfig.watchOptions = {
      poll: 1000,
      ignored: /node_modules/,
    };

    // Configuración del mapa de fuente y otros ajustes basados en el entorno
    webpackConfig.devtool = dev ? "source-map" : false;

    // Aquí puedes añadir o modificar la configuración de tus plugins.
    // Por ejemplo, ajustar el TerserPlugin si se utiliza para minimizar el JavaScript:
    if (!dev && target === 'web') {
      const terserPluginIndex = webpackConfig.optimization.minimizer.findIndex(
        minimizer => minimizer.constructor.name === 'TerserPlugin'
      );
      if (terserPluginIndex !== -1) {
        webpackConfig.optimization.minimizer[terserPluginIndex].options.parallel = 1;
      }
    }

    // Devuelve la configuración de webpack modificada
    return webpackConfig;
  },
};
