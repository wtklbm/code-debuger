import { DebugConfiguration } from "vscode";

export * from './extension'
export * from './normalizedLocale'
export * from './platform'
export * from './edition'


export declare type AnyObject = Record<string, any>;

export declare interface Provider {
  configuration: ProviderConfiguration;
  commands?: Array<string>;
  extensions?: Array<string>;
}

// @ts-ignore
export declare interface ProviderConfiguration extends DebugConfiguration {
  name?: string,
  type?: string,
  request?: 'launch',
  program?: string, 
  cwd?: string, 
  args?: string[], 
  smartStep?: boolean,
  sourceMaps?: boolean,
  stopOnEntry?: boolean
  command?: string,
}