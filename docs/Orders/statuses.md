# Order statuses
1.  Pre-Processing Phase
    - Created: The order has entered the WMS but has not been processed yet.
    - Open: The order is active and ready to be planned.
    - On Hold: The order is paused (e.g., due to credit issues or missing data) and cannot be processed until resolved.
    - Backordered: There is not enough stock to fulfill the order. It waits until new inventory arrives.
2. Planning Phase
    - Allocated: The inventory has been logically assigned to the order. The stock still sits on the shelf, but it is "reserved" for this specific customer.
    - Released: The order has been sent to the warehouse floor operations. It is now visible on the workers' RF devices (handheld scanners).
    - Waved: The order has been grouped into a "Wave" (a batch of orders) to be picked efficiently.
3. Execution Phase (Warehouse Floor)
    - Picking: A worker is currently moving through the aisles collecting the items.
    - Picked: All items for the order have been physically collected.
    - Short: The worker could not find all the items requested (inventory discrepancy). The order is incomplete.
    - Packing: The items are being packed into shipping boxes, weighed, and labeled.
    - Packed: The packing process is finished, and the parcel is sealed.
4. Shipping Phase
    - Staged: The packed order is sitting at the dock door, waiting for the truck.
    - Loaded: The order has been physically loaded onto the truck.
    - Shipped: The truck has left the facility. Inventory is permanently deducted, and the tracking number is active.
    - Completed: The full lifecycle is finished successfully.
    - Cancelled: The order was voided and the stock (if allocated) was released back to general inventory.
