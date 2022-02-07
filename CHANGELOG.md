<!--
Fix effect running an infinite loop when a setstate is called inside the effect with dependency as []. 
-->

## 1.0.1 (February 7, 2022)

- Optimize renderer
- Replace style attribute type to object from string
- Fix infinite loop on calling setstate inside an effect with dependency as []
- Fix renderer not updating array of components/elements

## 1.0.0 (February 5, 2022)

- Add hooks:
  - `soda.state`
  - `soda.effect`
  - `soda.ref`
- Add support for SVG
- Add render support for arrays

## 0.1.0 (January 19, 2022)

- Initial public release
