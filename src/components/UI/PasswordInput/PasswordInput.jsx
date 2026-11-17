import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../Input/Input";
import styles from "./PasswordInput.module.css";

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const checkCaps = (e) => setCapsOn(e.getModifierState?.("CapsLock") ?? false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      onKeyDown={checkCaps}
      onKeyUp={checkCaps}
      hint={capsOn ? "Caps Lock ჩართულია" : props.hint}
      rightSlot={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
    />
  );
}