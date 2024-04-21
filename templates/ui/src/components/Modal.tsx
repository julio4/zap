import React from "react";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  body: React.JSX.Element;
}

const Modal = (props: ModalProps) => {
  return (
    <div
      className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black
      bg-opacity-60 backdrop-blur-sm transition-opacity duration-300`}
      style={{ opacity: props.isOpen ? 1 : 0 }}
      onClick={() => props.setIsOpen(false)}
    >
      <div
        className="relative m-4 w-1/2 min-w-[50%] max-w-[50%] rounded-lg bg-transparent font-sans text-base font-light leading-relaxed antialiased shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {props.body}
      </div>
    </div>
  );
};

export default Modal;
