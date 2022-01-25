interface LucidElement {
    tag: keyof HTMLElementTagNameMap | ((props: {
        [key: string]: any;
    }, state: any) => LucidElement);
    attrs: {
        [key: string]: any;
    };
    children: string | any[];
}
declare class Lucid {
    createElement(tag: keyof HTMLElementTagNameMap | ((props: {
        [key: string]: any;
    }, state: any) => LucidElement), attrs: {
        [key: string]: any;
    }, ...children: any): LucidElement;
    render(dom: HTMLElement, element: LucidElement): void;
    _render(dom: HTMLElement, element: LucidElement): void;
    _update(dom: HTMLElement, element: LucidElement): void;
}
export declare const lucid: Lucid;
export {};
