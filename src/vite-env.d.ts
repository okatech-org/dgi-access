/// <reference types="vite/client" />

interface Window {
  BarcodeDetector?: new (options?: { formats?: string[] }) => {
    detect: (source: CanvasImageSource | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap) => Promise<Array<{ rawValue?: string }>>
  };
}

declare module 'quagga' {
  interface QuaggaConfig {
    inputStream?: {
      type?: string;
      target?: HTMLElement;
      constraints?: {
        facingMode?: string;
        width?: number;
        height?: number;
      };
    };
    decoder?: {
      readers?: string[];
    };
    locate?: boolean;
  }

  interface Detection {
    codeResult?: {
      code?: string;
    };
  }

  const Quagga: {
    init: (config: QuaggaConfig, callback: (err?: any) => void) => void;
    start: () => void;
    stop: () => void;
    onDetected: (callback: (data: Detection) => void) => void;
    offDetected: (callback?: (data: Detection) => void) => void;
  };

  export default Quagga;
}
