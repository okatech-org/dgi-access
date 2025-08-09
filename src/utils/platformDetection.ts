/**
 * Utilitaire de détection de plateforme pour PWA
 * Détecte iOS, Android et autres plateformes
 */

export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
export type Browser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'opera' | 'unknown';

interface PlatformInfo {
  platform: Platform;
  browser: Browser;
  isStandalone: boolean;
  isPWA: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  supportsPWA: boolean;
  version: string;
}

class PlatformDetector {
  private userAgent: string;
  private navigator: Navigator;

  constructor() {
    this.userAgent = window.navigator.userAgent.toLowerCase();
    this.navigator = window.navigator;
  }

  /**
   * Détecte le système d'exploitation
   */
  detectPlatform(): Platform {
    const ua = this.userAgent;
    
    // iOS detection (iPhone, iPad, iPod)
    if (/iphone|ipad|ipod/.test(ua) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'ios';
    }
    
    // Android detection
    if (/android/.test(ua)) {
      return 'android';
    }
    
    // Windows detection
    if (/windows|win32|win64/.test(ua)) {
      return 'windows';
    }
    
    // macOS detection
    if (/macintosh|mac os x/.test(ua) && navigator.maxTouchPoints === 0) {
      return 'macos';
    }
    
    // Linux detection
    if (/linux/.test(ua)) {
      return 'linux';
    }
    
    return 'unknown';
  }

  /**
   * Détecte le navigateur
   */
  detectBrowser(): Browser {
    const ua = this.userAgent;
    
    // Samsung Browser
    if (/samsungbrowser/.test(ua)) {
      return 'samsung';
    }
    
    // Opera
    if (/opera|opr/.test(ua)) {
      return 'opera';
    }
    
    // Edge
    if (/edg/.test(ua)) {
      return 'edge';
    }
    
    // Chrome (doit être après Edge car Edge contient "chrome")
    if (/chrome|chromium|crios/.test(ua)) {
      return 'chrome';
    }
    
    // Firefox
    if (/firefox|fxios/.test(ua)) {
      return 'firefox';
    }
    
    // Safari (doit être dernier car d'autres navigateurs peuvent contenir "safari")
    if (/safari/.test(ua) && !/chrome|chromium|crios/.test(ua)) {
      return 'safari';
    }
    
    return 'unknown';
  }

  /**
   * Détecte si l'app est en mode standalone (installée)
   */
  isStandalone(): boolean {
    // Pour iOS
    if ('standalone' in this.navigator) {
      return (this.navigator as any).standalone;
    }
    
    // Pour Android et autres
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    
    // Fallback pour les navigateurs qui ne supportent pas display-mode
    return window.navigator.standalone || 
           document.referrer.includes('android-app://');
  }

  /**
   * Détecte si c'est un appareil mobile
   */
  isMobile(): boolean {
    return /mobile|android|iphone|ipod/.test(this.userAgent) ||
           (navigator.maxTouchPoints > 0 && window.innerWidth <= 768);
  }

  /**
   * Détecte si c'est une tablette
   */
  isTablet(): boolean {
    return /ipad|tablet|playbook|silk/.test(this.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
           (/android/.test(this.userAgent) && !/mobile/.test(this.userAgent));
  }

  /**
   * Vérifie si la plateforme supporte les PWA
   */
  supportsPWA(): boolean {
    const platform = this.detectPlatform();
    const browser = this.detectBrowser();
    
    // iOS: Safari 11.3+ supporte les PWA (iOS 11.3+)
    if (platform === 'ios') {
      if (browser === 'safari') {
        const version = this.getIOSVersion();
        return version >= 11.3;
      }
      return false; // Autres navigateurs sur iOS ne supportent pas vraiment les PWA
    }
    
    // Android: Chrome, Samsung Browser, Edge supportent les PWA
    if (platform === 'android') {
      return ['chrome', 'samsung', 'edge', 'opera'].includes(browser);
    }
    
    // Desktop: Chrome, Edge, Firefox supportent les PWA
    return ['chrome', 'edge', 'firefox', 'opera'].includes(browser);
  }

  /**
   * Obtient la version d'iOS
   */
  private getIOSVersion(): number {
    const match = this.userAgent.match(/os (\d+)_(\d+)/);
    if (match) {
      return parseFloat(`${match[1]}.${match[2]}`);
    }
    return 0;
  }

  /**
   * Obtient toutes les informations de la plateforme
   */
  getPlatformInfo(): PlatformInfo {
    const platform = this.detectPlatform();
    const browser = this.detectBrowser();
    const isMobile = this.isMobile();
    const isTablet = this.isTablet();
    
    return {
      platform,
      browser,
      isStandalone: this.isStandalone(),
      isPWA: this.isStandalone() || window.matchMedia('(display-mode: standalone)').matches,
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      supportsPWA: this.supportsPWA(),
      version: this.userAgent
    };
  }

  /**
   * Obtient les instructions d'installation spécifiques à la plateforme
   */
  getInstallInstructions(): {
    title: string;
    steps: string[];
    icon: string;
  } {
    const platform = this.detectPlatform();
    const browser = this.detectBrowser();
    
    if (platform === 'ios') {
      return {
        title: "Installer sur iPhone/iPad",
        steps: [
          "Appuyez sur le bouton de partage en bas de l'écran",
          "Faites défiler et appuyez sur 'Sur l'écran d'accueil'",
          "Appuyez sur 'Ajouter' en haut à droite",
          "L'application sera ajoutée à votre écran d'accueil"
        ],
        icon: "share"
      };
    }
    
    if (platform === 'android') {
      if (browser === 'chrome' || browser === 'edge') {
        return {
          title: "Installer sur Android",
          steps: [
            "Appuyez sur le menu (3 points) en haut à droite",
            "Sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'",
            "Confirmez l'installation",
            "L'application sera ajoutée à votre écran d'accueil"
          ],
          icon: "more-vertical"
        };
      }
      
      if (browser === 'samsung') {
        return {
          title: "Installer sur Samsung",
          steps: [
            "Appuyez sur le menu en bas de l'écran",
            "Sélectionnez 'Ajouter la page à'",
            "Choisissez 'Écran d'accueil'",
            "Confirmez l'ajout"
          ],
          icon: "menu"
        };
      }
    }
    
    // Instructions pour desktop
    return {
      title: "Installer sur ordinateur",
      steps: [
        "Cliquez sur l'icône d'installation dans la barre d'adresse",
        "Ou utilisez le menu du navigateur et sélectionnez 'Installer'",
        "Confirmez l'installation",
        "L'application sera disponible dans vos applications"
      ],
      icon: "download"
    };
  }

  /**
   * Vérifie si l'utilisateur utilise un navigateur recommandé
   */
  isRecommendedBrowser(): boolean {
    const platform = this.detectPlatform();
    const browser = this.detectBrowser();
    
    if (platform === 'ios') {
      return browser === 'safari';
    }
    
    if (platform === 'android') {
      return ['chrome', 'samsung', 'edge'].includes(browser);
    }
    
    return ['chrome', 'edge', 'firefox'].includes(browser);
  }

  /**
   * Obtient une recommandation de navigateur si nécessaire
   */
  getBrowserRecommendation(): string | null {
    if (this.isRecommendedBrowser()) {
      return null;
    }
    
    const platform = this.detectPlatform();
    
    if (platform === 'ios') {
      return "Pour une meilleure expérience, utilisez Safari sur iOS";
    }
    
    if (platform === 'android') {
      return "Pour une meilleure expérience, utilisez Chrome ou Samsung Internet";
    }
    
    return "Pour une meilleure expérience, utilisez Chrome, Edge ou Firefox";
  }
}

// Export d'une instance singleton
export const platformDetector = new PlatformDetector();

// Export des fonctions utilitaires
export const getPlatformInfo = () => platformDetector.getPlatformInfo();
export const getInstallInstructions = () => platformDetector.getInstallInstructions();
export const isStandalone = () => platformDetector.isStandalone();
export const supportsPWA = () => platformDetector.supportsPWA();
export const getBrowserRecommendation = () => platformDetector.getBrowserRecommendation();