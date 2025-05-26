// Dependency injection container for managing service instances
import { Server } from "socket.io";
import { IUserService, IGameService, ISocketService } from "./interfaces";
import { UserService, GameService, SocketService } from "./implementations";

export interface ServiceContainer {
  userService: IUserService;
  gameService: IGameService;
  socketService: ISocketService;
}

export class DIContainer {
  private static instance: DIContainer;
  private services: Partial<ServiceContainer> = {};
  private initialized = false;

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  public initialize(io: Server): void {
    if (this.initialized) {
      console.warn("DIContainer is already initialized");
      return;
    }

    // Initialize services
    this.services.userService = new UserService();
    this.services.gameService = new GameService();
    this.services.socketService = new SocketService(io);

    this.initialized = true;
    console.log("✅ Dependency injection container initialized");
  }

  public getServices(): ServiceContainer {
    if (!this.initialized) {
      throw new Error(
        "DIContainer must be initialized before accessing services"
      );
    }

    return {
      userService: this.services.userService!,
      gameService: this.services.gameService!,
      socketService: this.services.socketService!,
    };
  }

  public getUserService(): IUserService {
    return this.getServices().userService;
  }

  public getGameService(): IGameService {
    return this.getServices().gameService;
  }

  public getSocketService(): ISocketService {
    return this.getServices().socketService;
  }

  // For testing purposes
  public reset(): void {
    this.services = {};
    this.initialized = false;
  }

  // Setter methods for dependency injection (useful for testing)
  public setUserService(service: IUserService): void {
    this.services.userService = service;
  }

  public setGameService(service: IGameService): void {
    this.services.gameService = service;
  }

  public setSocketService(service: ISocketService): void {
    this.services.socketService = service;
  }
}

// Export singleton instance
export const container = DIContainer.getInstance();
