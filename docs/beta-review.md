# Beta review for 1.0

These recommendations are for the maintainer’s review of the first release candidate. Every entry below is still Beta in the component registry. A Stable recommendation means the documented contract is a candidate for the 1.x compatibility guarantee. Experimental means keep the entry available with its current Beta label and collect the evidence in the last column.

| Current Beta entry | Proposed for 1.0 | Evidence or remaining decision |
| --- | --- | --- |
| [BarChart](https://alpinaui.com/docs/components/bar-chart/) | Stable | Direct labels, signed values, empty and loading states and a data-table alternative have rendering tests. |
| [ChartTable](https://alpinaui.com/docs/components/chart-table/) | Stable | Row and column headers retain the exact measurements when the comparison marks are hidden. |
| [FileInput](https://alpinaui.com/docs/components/file-input/) | Experimental | Form submission and keyboard selection have coverage. Verify clipboard, removal announcements and touch selection with assistive technology on devices. |
| [GridOverlay](https://alpinaui.com/docs/components/grid-overlay/) | Stable | Its small proofing API exposes the same columns as the layout grid. Browser tests exercise the responsive grid and keyboard shortcut. |
| [InvoiceDocument](https://alpinaui.com/docs/components/invoice-document/) | Experimental | Tax rounding and A4 layout have regression tests. Check multi-page invoices with billing teams and common printer margins. |
| [Letter](https://alpinaui.com/docs/components/letter/) | Experimental | The A4 layout has print coverage. Check physical left- and right-window envelopes with office printers before freezing window positions. |
| [LineChart](https://alpinaui.com/docs/components/line-chart/) | Stable | The description and alternative table expose every observation, including singleton and signed series. |
| [MultilingualField](https://alpinaui.com/docs/components/multilingual-field/) | Experimental | FormData names and keyboard switching have browser tests. Ask editors and screen-reader users to review copy-from-source and completeness announcements. |
| [QrBillScanner](https://alpinaui.com/docs/components/qr-bill-scanner/) | Experimental | Image and PDF fixtures exercise decoding. Confirm camera permission recovery and review on phones used at a counter. |
| [Sparkline](https://alpinaui.com/docs/components/sparkline/) | Stable | The small trend view shares the tested series, loading and table contracts with the larger plots. |
| [SwissLocalityCombobox](https://alpinaui.com/docs/components/swiss-locality-combobox/) | Experimental | Search, ranking and form submission have tests against the packaged swisstopo directory. Ask public-service and insurance teams to confirm the submitted municipality fields and the yearly data update. |
| [SwissQrBill](https://alpinaui.com/docs/components/swiss-qr-bill/) | Experimental | Payload, QR and print tests cover the generated slip. Obtain independent acceptance of representative printed bills before committing to the payment contract. |
| [UidInput](https://alpinaui.com/docs/components/uid-input/) | Stable | The CHE format and modulo-11 checksum are deterministic. Input and schema tests cover formatted values and invalid identifiers. |

No entry currently has a proposed replacement. A future Migrate decision needs a named alternative, a runnable migration and a deprecation window. Record each accepted decision in the registry and changelog after maintainer approval. [Component status](https://alpinaui.com/status/) · [API stability policy](https://alpinaui.com/docs/guides/api-stability/)
