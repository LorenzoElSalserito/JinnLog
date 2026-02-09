package com.lorenzodm.jinnlog;

import com.lorenzodm.jinnlog.util.PortManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * JinnLog Backend Application
 *
 * Architettura:
 * - Offline-first: funziona embedded in Electron
 * - Cloud-ready: stesso codice per servizio web futuro
 * - Porta dinamica: trova porta libera e la salva su file per Electron
 * - Cross-platform: dati salvati in user.home/.jinnlog
 *
 * Modalità operative:
 * - desktop: embedded in Electron, porta dinamica, SQLite locale
 * - web: standalone server, porta fissa, PostgreSQL (futuro)
 *CD DESKTOP
 *
 *
 * @author Lorenzo DM
 * @since 0.0.0
 */
@SpringBootApplication
public class JinnLogApplication {

	private static final Logger log = LoggerFactory.getLogger(JinnLogApplication.class);

	public static void main(String[] args) {
		// 1. Configura Data Path Cross-Platform
		String dataPath = setupDataPath();
		
		// Imposta property per Spring (usata in application.yml)
		System.setProperty("jinnlog.data.path", dataPath);
		
		// Banner custom
		System.setProperty("spring.banner.location", "classpath:banner.txt");

		SpringApplication.run(JinnLogApplication.class, args);
	}

	/**
	 * Calcola e prepara la cartella dati dell'applicazione.
	 * Usa ~/.jinnlog su Linux/Mac e C:\Users\User\.jinnlog su Windows.
	 */
	private static String setupDataPath() {
		String userHome = System.getProperty("user.home");
		String appFolderName = ".jinnlog";
		
		// Su Windows potremmo voler usare AppData, ma .jinnlog in user home è standard e sicuro
		String appPath = userHome + File.separator + appFolderName;
		
		File appDir = new File(appPath);
		if (!appDir.exists()) {
			boolean created = appDir.mkdirs();
			if (created) {
				System.out.println("✅ Creata cartella dati: " + appPath);
			} else {
				System.err.println("❌ Errore creazione cartella dati: " + appPath);
				// Fallback alla directory corrente in caso di disastro
				return "./data";
			}
		}
		
		return appPath;
	}

	/**
	 * Listener per evento ApplicationReady
	 * Scrive la porta dinamica su file per comunicazione con Electron
	 */
	@Bean
	ApplicationListener<ApplicationReadyEvent> applicationReadyListener(
			Environment environment,
			PortManager portManager) {

		return event -> {
			try {
				// Leggi porta effettiva assegnata
				String port = environment.getProperty("local.server.port");
				String mode = environment.getProperty("jinnlog.mode", "desktop");
				String dataPath = environment.getProperty("jinnlog.data.path");

				log.info("🚀 JinnLog Backend avviato!");
				log.info("📡 Modalità: {}", mode);
				log.info("🔌 Porta: {}", port);
				log.info("💾 Data path: {}", dataPath);

				// Assicurati che le sottodirectory esistano
				ensureDirectories(dataPath);

				// Se modalità desktop, salva porta su file
				if ("desktop".equals(mode)) {
					portManager.savePortToFile(Integer.parseInt(port));
					log.info("✅ Porta salvata su file config per Electron");
				}

				log.info("✨ JinnLog Backend pronto!");
				log.info("📚 API disponibili su: http://localhost:{}/api", port);

			} catch (Exception e) {
				log.error("❌ Errore durante inizializzazione", e);
			}
		};
	}

	/**
	 * Crea directory necessarie se non esistono
	 */
	private void ensureDirectories(String dataPath) {
		try {
			Path root = Paths.get(dataPath);
			Path config = root.resolve("config");
			Path assets = root.resolve("assets");
			Path logs = root.resolve("logs");

			Files.createDirectories(config);
			Files.createDirectories(assets);
			Files.createDirectories(logs);

			log.debug("✅ Directory verificate: config, assets, logs");

		} catch (Exception e) {
			log.error("❌ Errore creazione directory", e);
		}
	}
}
