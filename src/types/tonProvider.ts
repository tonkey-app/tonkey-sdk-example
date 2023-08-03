export {};

export type ITonProvider = {
  send(method: string): Promise<any>;
  send(method: string, args: any): Promise<any>;
};

declare global {
  interface Window {
    openmask: {
      provider: ITonProvider;
    };
  }
}
