import React, { type FC, type PropsWithChildren } from "react";

type ContainerProps = PropsWithChildren & {
  classNames?: string;
};

const Container: FC<ContainerProps> = ({ children, classNames = "" }) => {
  return <div className={`m-auto max-w-xl bg-slate-200 ${classNames}`}>{children}</div>;
};

export default Container;
