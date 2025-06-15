
export class DeliveryAssignmentNotFoundError extends Error {
  constructor(message = "Delivery assignment not found") {
    super(message);
    this.name = "DeliveryAssignmentNotFoundError";
  }
}
export class UnauthorizedDeliveryUserError extends Error {
  constructor(message = "Delivery user is not authorized for this assignment") {
    super(message);
    this.name = "UnauthorizedDeliveryUserError";
  }
}
export class InvalidStatusTransitionError extends Error {
  constructor(message = "Invalid status transition for delivery assignment") {
    super(message);
    this.name = "InvalidStatusTransitionError";
  }
}
export class LocationUpdateFailedError extends Error {
  constructor(message = "Failed to log location update") {
    super(message);
    this.name = "LocationUpdateFailedError";
  }
}
