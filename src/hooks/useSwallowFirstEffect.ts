import { useEffect, useRef } from "react";

export const useSwallowFirstEffect = (
  cb: Parameters<typeof useEffect>[0],
  deps: Parameters<typeof useEffect>[1],
) => {
  const firstEffectTriggered = useRef(false);
  useEffect(() => {
    /**
     * In strict mode, each hook is executed twice. To swallow both effects, we delay the hook callback by 50 ms and
     * only set the `firstEffectTriggered` ref when the delayed callback executes
     */
    let retVal: ReturnType<Parameters<typeof useEffect>[0]>;
    const _timeout = setTimeout(() => {
      if (!firstEffectTriggered.current) {
        firstEffectTriggered.current = true;
        return;
      }
      retVal = cb();
    }, 50);
    return () => {
      clearTimeout(_timeout);
      retVal && retVal();
    };
  }, deps);
};
