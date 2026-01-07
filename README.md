# tesseract
The cosmic cube that controls your warehouse Space

## Stack
The "JavaScript Everywhere" Stack (Recommended)
This is the most flexible option. It allows you to share up to 90% of your business logic between the server, the web browser, the desktop app, and the mobile app.

Language: TypeScript (preferred) or JavaScript.

Web (Online): React.js or Vue.js.

Desktop (Local): Electron (wraps your web app into a standalone desktop program) or Tauri.

Mobile (Scanner): React Native or Ionic.

Backend: Node.js (NestJS or Express).

Why it fits your WMS:

Offline Sync: You can use RxDB or PouchDB (local database) which syncs automatically with CouchDB or a PostgreSQL server when the connection is restored. This is crucial for warehouses with Wi-Fi dead zones.

Scanners: React Native has excellent libraries (like react-native-camera or react-native-vision-camera) that tap into the native mobile hardware for instant barcode scanning, which is much faster than a web-based camera scanner.

## order statuses
1. Pre-Processing Phase
Created / New: The order has entered the WMS but has not been processed yet.

Open: The order is active and ready to be planned.

On Hold / Held: The order is paused (e.g., due to credit issues or missing data) and cannot be processed until resolved.

Backordered: There is not enough stock to fulfill the order. It waits until new inventory arrives.

2. Planning Phase
Allocated / Reserved: The inventory has been logically assigned to the order. The stock still sits on the shelf, but it is "reserved" for this specific customer.

Released (to Warehouse): The order has been sent to the warehouse floor operations. It is now visible on the workers' RF devices (handheld scanners).

Waved: The order has been grouped into a "Wave" (a batch of orders) to be picked efficiently.

3. Execution Phase (Warehouse Floor)
Picking / In Picking: A worker is currently moving through the aisles collecting the items.

Picked / Pick Complete: All items for the order have been physically collected.

Short / Short Picked: The worker could not find all the items requested (inventory discrepancy). The order is incomplete.

Packing / In Packing: The items are being packed into shipping boxes, weighed, and labeled.

Packed: The packing process is finished, and the parcel is sealed.

4. Shipping Phase
Staged: The packed order is sitting at the dock door, waiting for the truck.

Loaded: The order has been physically loaded onto the truck.

Shipped / Dispatched: The truck has left the facility. Inventory is permanently deducted, and the tracking number is active.

Closed / Completed: The full lifecycle is finished successfully.

Cancelled: The order was voided and the stock (if allocated) was released back to general inventory.
