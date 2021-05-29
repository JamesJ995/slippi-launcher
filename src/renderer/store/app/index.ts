import { dolphinDownloadFinished, dolphinDownloadLogReceived, downloadDolphin } from "dolphin/ipc";
import log from "electron-log";
import firebase from "firebase";
import create from "zustand";

// import { useSettings } from "@/lib/hooks/useSettings";

type StoreState = {
  initialized: boolean;
  user: firebase.User | null;
  logMessage: string;
  snackbarContent: JSX.Element | undefined;
  snackbarOpen: boolean;
};

type StoreReducers = {
  initialize: () => Promise<void>;
  setUser: (user: firebase.User | null) => void;
  showSnackbar: (content?: JSX.Element) => void;
  dismissSnackbar: () => void;
};

const initialState: StoreState = {
  initialized: false,
  user: null,
  logMessage: "",
  snackbarContent: undefined,
  snackbarOpen: false,
};

export const useApp = create<StoreState & StoreReducers>((set, get) => ({
  // Set the initial state
  ...initialState,

  // Reducers
  initialize: async () => {
    if (get().initialized) {
      console.log("App is already initialized!");
      return;
    }

    console.log("Initializing app...");
    const promises: Promise<void>[] = [];

    dolphinDownloadLogReceived.renderer!.handle(async ({ message }) => {
      log.info(message);
      set({ logMessage: message });
    });

    promises.push(
      new Promise((resolve) => {
        const handler = dolphinDownloadFinished.renderer!.handle(async ({ error }) => {
          // We only want to handle this event once so immediately destroy
          handler.destroy();

          if (error) {
            const errMsg = "Error occurred while downloading Dolphin";
            log.error(errMsg, error);
            set({ logMessage: errMsg });
          }
          resolve();
        });
      }),
    );

    // Download Dolphin if necessary
    downloadDolphin.renderer!.trigger({});

    // If there's an ISO path already set then verify the ISO
    // const settingsState = useSettings.getState();
    // const currentIsoPath = settingsState.settings.isoPath;
    // if (currentIsoPath !== null) {
    // We have an iso path that we should probably validate
    // console.log(`starting iso verification: ${currentIsoPath}`);
    // promises.push(
    //   settingsState
    //     .verifyIsoPath(currentIsoPath)
    //     .then(() => {
    //       console.log("finished verifying iso");
    //     })
    //     .catch(log.error),
    // );
    // }

    await Promise.all(promises);
    set({ initialized: true });
  },

  setUser: (user) => {
    set({ user });
  },

  showSnackbar: (content?: JSX.Element) => {
    set({
      snackbarContent: content,
      snackbarOpen: true,
    });
  },

  dismissSnackbar: () => {
    set({ snackbarOpen: false });
  },
}));
