-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: teksystem
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `historicotarefa`
--

DROP TABLE IF EXISTS `historicotarefa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historicotarefa` (
  `HistoricoID` int NOT NULL AUTO_INCREMENT,
  `TarefaID` int DEFAULT NULL,
  `StatusAntigoID` int DEFAULT NULL,
  `StatusNovoID` int DEFAULT NULL,
  `AlteradoEm` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`HistoricoID`),
  KEY `StatusAntigoID` (`StatusAntigoID`),
  KEY `StatusNovoID` (`StatusNovoID`),
  KEY `historicotarefa_ibfk_1` (`TarefaID`),
  CONSTRAINT `historicotarefa_ibfk_1` FOREIGN KEY (`TarefaID`) REFERENCES `tarefas` (`TaskID`) ON DELETE CASCADE,
  CONSTRAINT `historicotarefa_ibfk_2` FOREIGN KEY (`StatusAntigoID`) REFERENCES `statustarefa` (`StatusID`),
  CONSTRAINT `historicotarefa_ibfk_3` FOREIGN KEY (`StatusNovoID`) REFERENCES `statustarefa` (`StatusID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historicotarefa`
--

LOCK TABLES `historicotarefa` WRITE;
/*!40000 ALTER TABLE `historicotarefa` DISABLE KEYS */;
/*!40000 ALTER TABLE `historicotarefa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statustarefa`
--

DROP TABLE IF EXISTS `statustarefa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statustarefa` (
  `StatusID` int NOT NULL AUTO_INCREMENT,
  `NomeStatus` enum('Pendente','Em Progresso','Concluída') NOT NULL,
  PRIMARY KEY (`StatusID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statustarefa`
--

LOCK TABLES `statustarefa` WRITE;
/*!40000 ALTER TABLE `statustarefa` DISABLE KEYS */;
INSERT INTO `statustarefa` VALUES (1,'Pendente'),(2,'Em Progresso'),(3,'Concluída');
/*!40000 ALTER TABLE `statustarefa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarefas`
--

DROP TABLE IF EXISTS `tarefas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarefas` (
  `TaskID` int NOT NULL AUTO_INCREMENT,
  `Titulo` varchar(255) NOT NULL,
  `Descricao` text NOT NULL,
  `StatusID` int DEFAULT NULL,
  `UsuarioID` int DEFAULT NULL,
  `CriadoEm` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Prioridade` tinyint NOT NULL,
  PRIMARY KEY (`TaskID`),
  KEY `StatusID` (`StatusID`),
  KEY `UsuarioID` (`UsuarioID`),
  CONSTRAINT `tarefas_ibfk_1` FOREIGN KEY (`StatusID`) REFERENCES `statustarefa` (`StatusID`),
  CONSTRAINT `tarefas_ibfk_2` FOREIGN KEY (`UsuarioID`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `chk_prioridade` CHECK ((`Prioridade` between 1 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarefas`
--

LOCK TABLES `tarefas` WRITE;
/*!40000 ALTER TABLE `tarefas` DISABLE KEYS */;
/*!40000 ALTER TABLE `tarefas` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `AtualizarHistoricoStatus` AFTER UPDATE ON `tarefas` FOR EACH ROW BEGIN
    -- Verifica se houve alteração no status da tarefa
    IF OLD.StatusID != NEW.StatusID THEN
        -- Insere um novo registro na tabela HistoricoTarefa
        INSERT INTO HistoricoTarefa (TarefaID, StatusAntigoID, StatusNovoID, AlteradoEm)
        VALUES (NEW.TaskID, OLD.StatusID, NEW.StatusID, NOW());
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `nomeUsuario` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `nomeUsuario` (`nomeUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'teste@teste.com','teste','teste123');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'teksystem'
--

--
-- Dumping routines for database 'teksystem'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-08  0:53:16
