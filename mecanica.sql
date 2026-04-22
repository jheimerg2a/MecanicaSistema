-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-04-2026 a las 09:59:27
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `mecanica`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `apellido`, `dni`, `telefono`, `email`, `direccion`, `created_at`, `updated_at`) VALUES
(1, 'Carlos', 'Mamani', '45678901', '987654321', 'carlos@gmail.com', 'Av. Los Andes 123', '2026-04-08 21:16:05', '2026-04-08 21:16:05'),
(2, 'yack', 'salvatierra ', '70080020', '977398357', 'yack@gmail.com', 'mirafloes', '2026-04-09 01:37:27', '2026-04-09 01:37:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `numero` varchar(30) NOT NULL COMMENT 'Ej: F-2025-001',
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `igv` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT '18% en Perú',
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado_pago` enum('pendiente','parcial','pagado') NOT NULL DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_trabajo`
--

CREATE TABLE `ordenes_trabajo` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL COMMENT 'Ej: OT-2025-001',
  `vehiculo_id` int(11) NOT NULL,
  `mecanico_id` int(11) DEFAULT NULL,
  `estado` enum('recibido','diagnostico','en_reparacion','espera_repuestos','listo','entregado','cancelado') NOT NULL DEFAULT 'recibido',
  `descripcion_problema` text NOT NULL,
  `observaciones` text DEFAULT NULL,
  `km_actual` int(11) DEFAULT NULL,
  `fecha_ingreso` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_estimada` date DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `mano_obra` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_repuestos`
--

CREATE TABLE `orden_repuestos` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `repuesto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_servicios`
--

CREATE TABLE `orden_servicios` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo` enum('efectivo','tarjeta','transferencia','yape','plin') NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `fecha_pago` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuestos`
--

CREATE TABLE `repuestos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(80) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  `precio_compra` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_venta` decimal(10,2) NOT NULL DEFAULT 0.00,
  `proveedor` varchar(120) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `repuestos`
--

INSERT INTO `repuestos` (`id`, `codigo`, `nombre`, `descripcion`, `categoria`, `stock`, `stock_minimo`, `precio_compra`, `precio_venta`, `proveedor`, `created_at`, `updated_at`) VALUES
(1, 'REP-001', 'Filtro de aceite Toyota', NULL, 'Filtros', 20, 5, 8.00, 15.00, NULL, '2026-04-08 18:36:23', '2026-04-08 18:36:23'),
(2, 'REP-002', 'Filtro de aire universal', NULL, 'Filtros', 15, 5, 12.00, 22.00, NULL, '2026-04-08 18:36:23', '2026-04-08 18:36:23'),
(3, 'REP-003', 'Aceite 20W50 x litro', NULL, 'Lubricantes', 50, 10, 6.00, 10.00, NULL, '2026-04-08 18:36:23', '2026-04-08 18:36:23'),
(4, 'REP-004', 'Pastilla de freno delantera', NULL, 'Frenos', 10, 3, 25.00, 45.00, NULL, '2026-04-08 18:36:23', '2026-04-08 18:36:23'),
(5, 'REP-005', 'Bujía NGK estándar', NULL, 'Encendido', 30, 8, 4.00, 8.00, NULL, '2026-04-08 18:36:23', '2026-04-08 18:36:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento`
--

CREATE TABLE `seguimiento` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `estado` enum('recibido','diagnostico','en_reparacion','espera_repuestos','listo','entregado','cancelado') NOT NULL,
  `comentario` text DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL COMMENT 'ruta de foto opcional del trabajo',
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_base` decimal(10,2) NOT NULL DEFAULT 0.00,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `descripcion`, `precio_base`, `activo`) VALUES
(1, 'Cambio de aceite y filtro', NULL, 45.00, 1),
(2, 'Alineación y balanceo', NULL, 60.00, 1),
(3, 'Revisión general', NULL, 80.00, 1),
(4, 'Cambio de frenos delanteros', NULL, 120.00, 1),
(5, 'Cambio de batería', NULL, 50.00, 1),
(6, 'Diagnóstico computarizado', NULL, 40.00, 1),
(7, 'Cambio de bujías', NULL, 55.00, 1),
(8, 'Servicio de transmisión', NULL, 150.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','mecanico') NOT NULL DEFAULT 'mecanico',
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol`, `telefono`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@taller.com', '$2b$10$FxIp9eCt1g5q2EkvpvK5PuzNSsBAvFRYyzixYWcoOWlTg4hKaI1FW', 'admin', NULL, 1, '2026-04-08 18:36:23', '2026-04-09 01:14:09'),
(2, 'Juan Pérez', 'juan@taller.com', '$2b$10$examplehashJuan123xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'mecanico', NULL, 1, '2026-04-08 18:36:23', '2026-04-08 18:36:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) NOT NULL,
  `placa` varchar(20) NOT NULL,
  `marca` varchar(60) NOT NULL,
  `modelo` varchar(60) NOT NULL,
  `anio` year(4) DEFAULT NULL,
  `color` varchar(40) DEFAULT NULL,
  `tipo` varchar(40) DEFAULT NULL COMMENT 'sedan, SUV, pickup, etc.',
  `vin` varchar(50) DEFAULT NULL,
  `km_ingreso` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `cliente_id`, `placa`, `marca`, `modelo`, `anio`, `color`, `tipo`, `vin`, `km_ingreso`, `created_at`) VALUES
(1, 1, 'ABC123', 'Toyota', 'Yaris', '2018', 'Rojo', NULL, NULL, 0, '2026-04-08 22:54:56'),
(2, 2, 'ACE444', 'Toyota', 'japones', '2000', 'blanco', 'Van', '4', 30000, '2026-04-09 01:55:48');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_consulta_cliente`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_consulta_cliente` (
`orden` varchar(20)
,`cliente` varchar(201)
,`dni` varchar(20)
,`placa` varchar(20)
,`vehiculo` varchar(121)
,`estado` enum('recibido','diagnostico','en_reparacion','espera_repuestos','listo','entregado','cancelado')
,`problema` text
,`fecha_ingreso` datetime
,`fecha_estimada` date
,`ultimo_comentario` text
,`ultima_actualizacion` datetime
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_ordenes_resumen`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_ordenes_resumen` (
`id` int(11)
,`codigo` varchar(20)
,`cliente` varchar(201)
,`telefono` varchar(20)
,`placa` varchar(20)
,`vehiculo` varchar(121)
,`mecanico` varchar(100)
,`estado` enum('recibido','diagnostico','en_reparacion','espera_repuestos','listo','entregado','cancelado')
,`fecha_ingreso` datetime
,`fecha_estimada` date
,`total_factura` decimal(10,2)
,`estado_pago` enum('pendiente','parcial','pagado')
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_stock_bajo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_stock_bajo` (
`id` int(11)
,`codigo` varchar(50)
,`nombre` varchar(150)
,`categoria` varchar(80)
,`stock` int(11)
,`stock_minimo` int(11)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_consulta_cliente`
--
DROP TABLE IF EXISTS `v_consulta_cliente`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_consulta_cliente`  AS SELECT `ot`.`codigo` AS `orden`, concat(`c`.`nombre`,' ',`c`.`apellido`) AS `cliente`, `c`.`dni` AS `dni`, `v`.`placa` AS `placa`, concat(`v`.`marca`,' ',`v`.`modelo`) AS `vehiculo`, `ot`.`estado` AS `estado`, `ot`.`descripcion_problema` AS `problema`, `ot`.`fecha_ingreso` AS `fecha_ingreso`, `ot`.`fecha_estimada` AS `fecha_estimada`, `s`.`comentario` AS `ultimo_comentario`, `s`.`fecha` AS `ultima_actualizacion` FROM (((`ordenes_trabajo` `ot` join `vehiculos` `v` on(`v`.`id` = `ot`.`vehiculo_id`)) join `clientes` `c` on(`c`.`id` = `v`.`cliente_id`)) left join (select `seguimiento`.`orden_id` AS `orden_id`,`seguimiento`.`comentario` AS `comentario`,`seguimiento`.`fecha` AS `fecha` from `seguimiento` where (`seguimiento`.`orden_id`,`seguimiento`.`fecha`) in (select `seguimiento`.`orden_id`,max(`seguimiento`.`fecha`) from `seguimiento` group by `seguimiento`.`orden_id`)) `s` on(`s`.`orden_id` = `ot`.`id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_ordenes_resumen`
--
DROP TABLE IF EXISTS `v_ordenes_resumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ordenes_resumen`  AS SELECT `ot`.`id` AS `id`, `ot`.`codigo` AS `codigo`, concat(`c`.`nombre`,' ',`c`.`apellido`) AS `cliente`, `c`.`telefono` AS `telefono`, `v`.`placa` AS `placa`, concat(`v`.`marca`,' ',`v`.`modelo`) AS `vehiculo`, `u`.`nombre` AS `mecanico`, `ot`.`estado` AS `estado`, `ot`.`fecha_ingreso` AS `fecha_ingreso`, `ot`.`fecha_estimada` AS `fecha_estimada`, coalesce(`f`.`total`,0) AS `total_factura`, `f`.`estado_pago` AS `estado_pago` FROM ((((`ordenes_trabajo` `ot` join `vehiculos` `v` on(`v`.`id` = `ot`.`vehiculo_id`)) join `clientes` `c` on(`c`.`id` = `v`.`cliente_id`)) left join `usuarios` `u` on(`u`.`id` = `ot`.`mecanico_id`)) left join `facturas` `f` on(`f`.`orden_id` = `ot`.`id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_stock_bajo`
--
DROP TABLE IF EXISTS `v_stock_bajo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stock_bajo`  AS SELECT `repuestos`.`id` AS `id`, `repuestos`.`codigo` AS `codigo`, `repuestos`.`nombre` AS `nombre`, `repuestos`.`categoria` AS `categoria`, `repuestos`.`stock` AS `stock`, `repuestos`.`stock_minimo` AS `stock_minimo` FROM `repuestos` WHERE `repuestos`.`stock` <= `repuestos`.`stock_minimo` ORDER BY `repuestos`.`stock`- `repuestos`.`stock_minimo` ASC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orden_id` (`orden_id`),
  ADD UNIQUE KEY `numero` (`numero`);

--
-- Indices de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `fk_ot_vehiculo` (`vehiculo_id`),
  ADD KEY `fk_ot_mecanico` (`mecanico_id`);

--
-- Indices de la tabla `orden_repuestos`
--
ALTER TABLE `orden_repuestos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_or_orden` (`orden_id`),
  ADD KEY `fk_or_repuesto` (`repuesto_id`);

--
-- Indices de la tabla `orden_servicios`
--
ALTER TABLE `orden_servicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_os_orden` (`orden_id`),
  ADD KEY `fk_os_servicio` (`servicio_id`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pago_factura` (`factura_id`);

--
-- Indices de la tabla `repuestos`
--
ALTER TABLE `repuestos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_seg_orden` (`orden_id`),
  ADD KEY `fk_seg_usuario` (`usuario_id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `placa` (`placa`),
  ADD KEY `fk_veh_cliente` (`cliente_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_repuestos`
--
ALTER TABLE `orden_repuestos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_servicios`
--
ALTER TABLE `orden_servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `repuestos`
--
ALTER TABLE `repuestos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_fac_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo` (`id`);

--
-- Filtros para la tabla `ordenes_trabajo`
--
ALTER TABLE `ordenes_trabajo`
  ADD CONSTRAINT `fk_ot_mecanico` FOREIGN KEY (`mecanico_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_ot_vehiculo` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`);

--
-- Filtros para la tabla `orden_repuestos`
--
ALTER TABLE `orden_repuestos`
  ADD CONSTRAINT `fk_or_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo` (`id`),
  ADD CONSTRAINT `fk_or_repuesto` FOREIGN KEY (`repuesto_id`) REFERENCES `repuestos` (`id`);

--
-- Filtros para la tabla `orden_servicios`
--
ALTER TABLE `orden_servicios`
  ADD CONSTRAINT `fk_os_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo` (`id`),
  ADD CONSTRAINT `fk_os_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `fk_pago_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`);

--
-- Filtros para la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD CONSTRAINT `fk_seg_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes_trabajo` (`id`),
  ADD CONSTRAINT `fk_seg_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `fk_veh_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
