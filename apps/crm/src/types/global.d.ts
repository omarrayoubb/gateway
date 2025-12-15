/// <reference types="node" />

declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export const sep: string;
  export const delimiter: string;
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  
  interface Process {
    env: ProcessEnv;
    cwd(): string;
  }
}

declare const process: NodeJS.Process;
declare const __dirname: string;

