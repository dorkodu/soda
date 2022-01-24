interface LucidElement {
    tag: keyof HTMLElementTagNameMap | ((props: {
        [key: string]: any;
    }) => LucidElement);
    props: {
        [key: string]: any;
    };
    children: string | any[];
}
declare class Lucid {
    private id;
    private state;
    createElement(tag: keyof HTMLElementTagNameMap | ((props: {
        [key: string]: any;
    }) => LucidElement), props: {
        [key: string]: any;
    }, ...children: any): LucidElement;
    render(dom: HTMLElement, element: LucidElement): any;
    _render(dom: HTMLElement, element: LucidElement): void;
    _rerender(dom: HTMLElement, element: LucidElement): void;
}
export declare const lucid: Lucid;
export {};
