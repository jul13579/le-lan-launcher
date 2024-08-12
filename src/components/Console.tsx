import { Box } from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";

interface ConsoleProps {
  messages: SyncServiceMessageObj[];
}

export const Console: FunctionComponent<ConsoleProps> = ({ messages }) => {
  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleEl = useRef<HTMLDivElement>();

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // Don't register mutation observer if `autoScroll` is not enabled
    if (!autoScroll) {
      return;
    }
    // Make sure the console element is set
    if (!consoleEl.current) {
      return;
    }

    const { current: el } = consoleEl;

    const consoleScrollHandler = () => {
      if (el.scrollTop >= el.scrollHeight - el.getBoundingClientRect().height) {
        setAutoScroll(true);
        return;
      }
      setAutoScroll(false);
    };

    const observer = new MutationObserver(() => {
      el.removeEventListener("scrollend", consoleScrollHandler);
      el.lastElementChild.scrollIntoView(
        false, // align at bottom of element
      );
      el.addEventListener("scrollend", consoleScrollHandler);
    });
    observer.observe(el, { childList: true });
    return () => observer.disconnect();
  }, [autoScroll]);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Box
      ref={consoleEl}
      height={"100%"}
      whiteSpace={"pre"}
      overflow={"auto"}
      display={"flex"}
      flexDirection={"column"}
    >
      {messages.map((messageObj, index) => (
        <span
          key={index}
          style={{
            color: messageObj.type === "stderr" ? "red" : "inherit",
          }}
        >
          {messageObj.message}
        </span>
      ))}
    </Box>
  );
};
