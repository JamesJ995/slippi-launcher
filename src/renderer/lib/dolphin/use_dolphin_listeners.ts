import type {
  DolphinDownloadCompleteEvent,
  DolphinDownloadProgressEvent,
  DolphinDownloadStartEvent,
  DolphinNetplayClosedEvent,
  DolphinOfflineEvent,
  DolphinPlaybackClosedEvent,
  DolphinService,
} from "@dolphin/types";
import { DolphinEventType, DolphinLaunchType } from "@dolphin/types";
import { useCallback, useEffect } from "react";

import { useToasts } from "@/lib/hooks/use_toasts";

import { handleDolphinExitCode } from "./handle_dolphin_exit_code";
import {
  DolphinStatus,
  setDolphinOpened,
  setDolphinStatus,
  setDolphinVersion,
  updateNetplayDownloadProgress,
} from "./use_dolphin_store";

// Setup listeners for DolphinService
export const useDolphinListeners = (dolphinService: DolphinService) => {
  const { showError, showWarning } = useToasts();
  const dolphinClosedHandler = useCallback(
    ({ dolphinType, exitCode }: DolphinNetplayClosedEvent | DolphinPlaybackClosedEvent) => {
      setDolphinOpened(dolphinType, false);

      // Check if it exited cleanly
      const errMsg = handleDolphinExitCode(exitCode);
      if (errMsg) {
        showError(errMsg);
      }
    },
    [showError],
  );

  const dolphinProgressHandler = useCallback((event: DolphinDownloadProgressEvent) => {
    if (event.dolphinType === DolphinLaunchType.NETPLAY) {
      updateNetplayDownloadProgress(event.progress);
    }
  }, []);

  const dolphinCompleteHandler = useCallback((event: DolphinDownloadCompleteEvent) => {
    setDolphinStatus(event.dolphinType, DolphinStatus.READY);
    setDolphinVersion(event.dolphinVersion, event.dolphinType);
  }, []);

  const dolphinOfflineHandler = useCallback(
    (event: DolphinOfflineEvent) => {
      showWarning("You seem to be offline, some functionality of the Launcher and Dolphin will be unavailable.");
      setDolphinStatus(event.dolphinType, DolphinStatus.READY);
    },
    [showWarning],
  );

  const dolphinDownloadStartHandler = useCallback((event: DolphinDownloadStartEvent) => {
    setDolphinStatus(event.dolphinType, DolphinStatus.DOWNLOADING);
  }, []);

  useEffect(() => {
    const subs: Array<() => void> = [];
    subs.push(dolphinService.onEvent(DolphinEventType.CLOSED, dolphinClosedHandler));
    subs.push(dolphinService.onEvent(DolphinEventType.DOWNLOAD_START, dolphinDownloadStartHandler));
    subs.push(dolphinService.onEvent(DolphinEventType.DOWNLOAD_PROGRESS, dolphinProgressHandler));
    subs.push(dolphinService.onEvent(DolphinEventType.DOWNLOAD_COMPLETE, dolphinCompleteHandler));
    subs.push(dolphinService.onEvent(DolphinEventType.OFFLINE, dolphinOfflineHandler));

    return () => {
      subs.forEach((unsub) => unsub());
    };
  }, [
    dolphinService,
    dolphinClosedHandler,
    dolphinProgressHandler,
    dolphinCompleteHandler,
    dolphinDownloadStartHandler,
    dolphinOfflineHandler,
  ]);
};
