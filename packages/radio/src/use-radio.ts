import { useBoolean, useControllableProp } from "@chakra-ui/hooks"
import {
  dataAttr,
  ariaAttr,
  callAllHandlers,
  Dict,
  mergeRefs,
} from "@chakra-ui/utils"
import { visuallyHiddenStyle } from "@chakra-ui/visually-hidden"
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react"

/**
 * @todo use the `useClickable` hook here
 * to manage the isFocusable & isDisabled props
 */
export interface UseRadioProps {
  /**
   * id assigned to input
   */
  id?: string
  /**
   * The name of the input field in a radio
   * (Useful for form submission).
   */
  name?: string
  /**
   * The value to be used in the radio button.
   * This is the value that will be returned on form submission.
   */
  value?: string | number
  /**
   * If `true`, the radio will be checked.
   * You'll need to pass `onChange` to update it's value (since it's now controlled)
   */
  isChecked?: boolean
  /**
   * If `true`, the radio will be initially checked.
   */
  defaultIsChecked?: boolean
  /**
   * If `true`, the radio will be disabled
   */
  isDisabled?: boolean
  /**
   * If `true` and `isDisabled` is true, the radio will remain
   * focusable but not interactive.
   */
  isFocusable?: boolean
  /**
   * If `true`, the radio will be read-only
   */
  isReadOnly?: boolean
  /**
   * If `true`, the radio button will be invalid. This sets `aria-invalid` to `true`.
   */
  isInvalid?: boolean
  /**
   * If `true`, the radio button will be invalid. This sets `aria-invalid` to `true`.
   */
  isRequired?: boolean
  /**
   * Function called when checked state of the `input` changes
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export function useRadio(props: UseRadioProps = {}) {
  const {
    defaultIsChecked,
    isChecked: isCheckedProp,
    isFocusable,
    isDisabled,
    isReadOnly,
    isRequired,
    onChange,
    isInvalid,
    name,
    value,
    id,
    ...htmlProps
  } = props

  const [isFocused, setFocused] = useBoolean()
  const [isHovered, setHovering] = useBoolean()
  const [isActive, setActive] = useBoolean()

  const ref = useRef<HTMLInputElement>(null)

  const [isCheckedState, setChecked] = useState(Boolean(defaultIsChecked))

  const [isControlled, isChecked] = useControllableProp(
    isCheckedProp,
    isCheckedState,
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || isDisabled) {
      event.preventDefault()
      return
    }

    if (!isControlled) {
      setChecked(event.target.checked)
    }

    onChange?.(event)
  }

  const trulyDisabled = isDisabled && !isFocusable

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === " ") {
        setActive.on()
      }
    },
    [setActive],
  )

  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === " ") {
        setActive.off()
      }
    },
    [setActive],
  )

  return {
    state: {
      isInvalid,
      isFocused,
      isChecked,
      isActive,
      isHovered,
      isDisabled,
      isReadOnly,
      isRequired,
    },
    getCheckboxProps: (props: Dict = {}) => ({
      ...props,
      "data-active": dataAttr(isActive),
      "data-hover": dataAttr(isHovered),
      "data-disabled": dataAttr(isDisabled),
      "data-invalid": dataAttr(isInvalid),
      "data-checked": dataAttr(isChecked),
      "data-focus": dataAttr(isFocused),
      "data-readonly": dataAttr(isReadOnly),
      "aria-hidden": true,
      onMouseDown: callAllHandlers(props.onMouseDown, setActive.on),
      onMouseUp: callAllHandlers(props.onMouseUp, setActive.off),
      onMouseEnter: callAllHandlers(props.onMouseEnter, setHovering.on),
      onMouseLeave: callAllHandlers(props.onMouseLeave, setHovering.off),
    }),
    getInputProps: (props: Dict = {}) => ({
      ...props,
      ref: mergeRefs(props.ref, ref),
      type: "radio",
      name,
      value,
      id,
      onChange: callAllHandlers(props.onChange, handleChange),
      onBlur: callAllHandlers(props.onBlur, setFocused.off),
      onFocus: callAllHandlers(props.onFocus, setFocused.on),
      onKeyDown: callAllHandlers(props.onKeyDown, onKeyDown),
      onKeyUp: callAllHandlers(props.onKeyUp, onKeyUp),
      "aria-required": ariaAttr(isRequired),
      checked: isChecked,
      disabled: trulyDisabled,
      readOnly: isReadOnly,
      "aria-invalid": ariaAttr(isInvalid),
      "aria-disabled": ariaAttr(isDisabled),
      style: visuallyHiddenStyle,
    }),
    getLabelProps: (props: Dict = {}) => {
      /**
       * Prevent `onBlur` being fired when the checkbox label is touched
       */
      const stop = (event: React.SyntheticEvent) => {
        event.preventDefault()
        event.stopPropagation()
      }
      return {
        ...props,
        style: { ...props.style, touchAction: "none" },
        onMouseDown: callAllHandlers(props.onMouseDown, stop),
        onTouchStart: callAllHandlers(props.onTouchState, stop),
        "data-disabled": dataAttr(isDisabled),
        " data-checked": dataAttr(isChecked),
        "data-invalid": dataAttr(isInvalid),
      }
    },
    htmlProps,
  }
}

export type UseRadioReturn = ReturnType<typeof useRadio>
