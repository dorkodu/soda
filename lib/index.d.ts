interface SodaElement {
    tag: string | ((component: any) => SodaElement);
    attrs: SodaAttributes;
    children: string | any[];
}
declare type SodaAttributes = {
    [key: string]: any;
};
declare class Soda {
    private components;
    private currentComponent;
    private id;
    private work;
    state(value: any, cb?: (prev: any, next: any) => boolean): any[];
    effect(cb: () => (() => void) | void, deps: any[]): void;
    ref(): any;
    private createElement;
    render(element: SodaElement, dom: HTMLElement): number | undefined;
    private _render;
    private _update;
    private setDomAttribute;
    private removeDomAttribute;
    private processWork;
}
export declare const soda: Soda;
export {};
