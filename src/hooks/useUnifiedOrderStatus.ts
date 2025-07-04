import { useEffect, useReducer, useCallback } from "react";
import { unifiedOrderStatusService } from "@/services/orders/unifiedOrderStatusService";
import { Order } from "@/types/order";

type OrderStatusState = {
  loading: { initial: boolean; updates: boolean };
  error: null | Error;
  orderData: Order | null;
};

type OrderStatusAction =
  | { type: "LOADING_START"; variant: "initial" | "updates" }
  | { type: "LOADING_END"; variant: "initial" | "updates" }
  | { type: "SET_DATA"; payload: Order }
  | { type: "SET_ERROR"; payload: Error }
  | { type: "CLEAR_ERROR" };

const initialState: OrderStatusState = {
  loading: { initial: false, updates: false },
  error: null,
  orderData: null,
};

function reducer(state: OrderStatusState, action: OrderStatusAction): OrderStatusState {
  switch (action.type) {
    case "LOADING_START":
      return {
        ...state,
        loading: { ...state.loading, [action.variant]: true },
      };
    case "LOADING_END":
      return {
        ...state,
        loading: { ...state.loading, [action.variant]: false },
      };
    case "SET_DATA":
      return {
        ...state,
        orderData: action.payload,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Centralized error handling for clarity
function handleHookError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);
  return new Error("Unknown error");
}

interface UseUnifiedOrderStatusResult {
  orderData: Order | null;
  loading: { initial: boolean; updates: boolean };
  error: Error | null;
  refetch: () => void;
}

export function useUnifiedOrderStatus(orderId: string): UseUnifiedOrderStatusResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch the order data
  const fetchOrderData = useCallback(async () => {
    if (!orderId) return;
    dispatch({ type: "LOADING_START", variant: "initial" });
    try {
      const order = await unifiedOrderStatusService.getOrderStatusWithTracking(orderId);
      // Enforce all required fields for Order type
      if (!order || !order.customer_id || !order.customer_name || !order.customer_email || !order.customer_phone || !order.delivery_address || !order.city || !order.delivery_method || !order.payment_method || order.delivery_fee === undefined || order.subtotal === undefined || order.total === undefined || !order.status) {
        throw new Error("Order not found or incomplete order data");
      }
      dispatch({ type: "SET_DATA", payload: order as Order });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: handleHookError(err) });
    } finally {
      dispatch({ type: "LOADING_END", variant: "initial" });
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderData();

    if (!orderId) return;

    // Only use the instance (unifiedOrderStatusService), not the class/type
    let unsubscribe: undefined | (() => void) = undefined;
    if (
      typeof unifiedOrderStatusService.subscribeToOrderStatus === "function"
    ) {
      unsubscribe = unifiedOrderStatusService.subscribeToOrderStatus(
        orderId,
        (order) => {
          if (order) {
            dispatch({ type: "SET_DATA", payload: order });
          }
        },
        (error: unknown) => {
          dispatch({ type: "SET_ERROR", payload: handleHookError(error) });
        }
      );
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[useUnifiedOrderStatus] subscribeToOrderStatus is not implemented on unifiedOrderStatusService. Real-time updates disabled."
        );
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchOrderData, orderId]);

  const refetch = useCallback(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  return {
    orderData: state.orderData,
    loading: state.loading,
    error: state.error,
    refetch,
  };
}
