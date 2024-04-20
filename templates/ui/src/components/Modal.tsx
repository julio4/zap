import React from "react";

interface ModalProps {
  close: () => void;
  body: React.JSX.Element;
}

const Modal = (props: ModalProps) => {
  return (
    <div className="z-10 justify-center items-center">
      <div
        className="fixed top-0 left-0 w-screen h-screen z-40 bg-neutral-800 opacity-50"
        onClick={props.close}
      />
      <div className="fixed z-50 top-[20%] left-[20%] max-h-[500px] overflow-y-scroll">
        {props.body}
      </div>
    </div>
  );
};

export default Modal;
