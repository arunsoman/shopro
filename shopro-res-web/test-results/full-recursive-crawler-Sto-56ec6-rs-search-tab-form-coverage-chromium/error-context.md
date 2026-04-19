# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-recursive-crawler.spec.ts >> Store-Driven Crawler v9 — content-area selectors + search/tab/form coverage
- Location: tests/e2e/full-recursive-crawler.spec.ts:67:1

# Error details

```
Test timeout of 600000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - button "Home" [ref=e6] [cursor=pointer]:
          - img [ref=e7]
        - button "Menu" [ref=e9] [cursor=pointer]:
          - img [ref=e10]
        - generic [ref=e12]: Nexus
        - generic [ref=e13]:
          - img [ref=e14]
          - textbox "Search…" [ref=e16]
      - generic [ref=e17]:
        - button "Theme" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
        - button "🇺🇸" [ref=e21] [cursor=pointer]
        - button "Logout" [ref=e22] [cursor=pointer]:
          - img [ref=e23]
    - generic [ref=e25]:
      - complementary:
        - generic [ref=e26]:
          - button "Dashboard" [ref=e27] [cursor=pointer]:
            - img [ref=e28]
            - text: Dashboard
          - button "Inventory" [ref=e30] [cursor=pointer]:
            - img [ref=e31]
            - text: Inventory
          - button "Kitchen" [ref=e33] [cursor=pointer]:
            - img [ref=e34]
            - text: Kitchen
          - button "Prime Cost" [ref=e36] [cursor=pointer]:
            - img [ref=e37]
            - text: Prime Cost
          - button "Engineering" [ref=e39] [cursor=pointer]:
            - img [ref=e40]
            - text: Engineering
          - button "Purchasing" [ref=e42] [cursor=pointer]:
            - img [ref=e43]
            - text: Purchasing
          - button "Experiments" [ref=e45] [cursor=pointer]:
            - img [ref=e46]
            - text: Experiments
          - button "Reports" [ref=e48] [cursor=pointer]:
            - img [ref=e49]
            - text: Reports
          - button "Supplier Pay" [ref=e51] [cursor=pointer]:
            - img [ref=e52]
            - text: Supplier Pay
          - button "Staff & Labor" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
            - text: Staff & Labor
          - button "Kitchen Costs" [ref=e57] [cursor=pointer]:
            - img [ref=e58]
            - text: Kitchen Costs
      - generic [ref=e62]:
        - banner [ref=e63]:
          - generic [ref=e64]:
            - button [ref=e65] [cursor=pointer]:
              - img [ref=e66]
            - generic [ref=e68]:
              - generic [ref=e70]: DRAFT Blueprint
              - heading "New Purchase Order" [level=1] [ref=e71]
          - generic [ref=e72]:
            - button "Discard Draft" [ref=e73] [cursor=pointer]:
              - img [ref=e74]
              - text: Discard Draft
            - button "Send Order" [ref=e77] [cursor=pointer]:
              - img [ref=e78]
              - text: Send Order
        - generic [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e85]:
                - img [ref=e87]
                - heading "Order Identity" [level=3] [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]:
                  - text: Supplier Entity
                  - textbox [ref=e92]
                - generic [ref=e93]:
                  - text: Order Reference
                  - textbox [ref=e94]
                - generic [ref=e95]:
                  - text: Issue Date
                  - textbox [ref=e96]
            - generic [ref=e97]:
              - generic [ref=e98]:
                - generic [ref=e99]:
                  - img [ref=e100]
                  - heading "Procurement Items" [level=3] [ref=e104]
                - button "Add Material" [ref=e105] [cursor=pointer]:
                  - img [ref=e106]
                  - text: Add Material
              - generic [ref=e108]:
                - generic [ref=e109]: Idx
                - generic [ref=e110]: Component
                - generic [ref=e111]: Ordered Qty
                - generic [ref=e112]: Unit Price
                - generic [ref=e113]: Subtotal
          - complementary [ref=e115]:
            - generic [ref=e116]:
              - generic [ref=e117]:
                - heading "Procurement Value" [level=4] [ref=e118]
                - img [ref=e119]
              - generic [ref=e123]:
                - paragraph [ref=e124]: $0.00
                - paragraph [ref=e125]: Total PO Amount (Estimate)
              - generic [ref=e126]: Controlled Ledger Record
            - generic [ref=e127]:
              - generic [ref=e128]:
                - heading "Financial Guard" [level=4] [ref=e129]
                - paragraph [ref=e130]: Ensure delivery window matches the prep schedule for the coming weekend surge.
              - img [ref=e131]
    - contentinfo [ref=e142]:
      - generic [ref=e143]: © 2025 ShoPro AI
      - generic [ref=e144]: "|"
      - generic [ref=e145]: v1.8.0
      - generic [ref=e146]: Session 09:44
      - generic [ref=e147]: "|"
  - generic "Notifications"
  - generic [ref=e148]: "0"
```