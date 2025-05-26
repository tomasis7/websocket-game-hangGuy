// Base controller interface with common functionality
import { Socket } from "socket.io";
import { Result, AsyncResult } from "../../../../shared/types";

export interface IBaseController {
  /**
   * Initialize the controller with dependencies
   */
  initialize(): AsyncResult<void>;

  /**
   * Handle socket connection
   */
  handleConnection(socket: Socket): AsyncResult<void>;

  /**
   * Handle socket disconnection
   */
  handleDisconnection(socket: Socket): AsyncResult<void>;

  /**
   * Get controller name for logging
   */
  getName(): string;
}
