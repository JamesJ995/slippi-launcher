import styled from "@emotion/styled";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconTypeMap } from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import React from "react";

const Outer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

type MessageProps = {
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  label?: string;
};

export const Message = ({ children, className, icon, label, style }: React.PropsWithChildren<MessageProps>) => {
  return (
    <Outer style={style} className={className}>
      {icon}
      {label && (
        <Typography variant="h6" style={{ marginTop: 20, textAlign: "center" }}>
          {label}
        </Typography>
      )}
      {children}
    </Outer>
  );
};

type IconMessageProps = Omit<MessageProps, "icon"> & {
  Icon: OverridableComponent<SvgIconTypeMap>;
};

export const IconMessage = ({ Icon, ...rest }: React.PropsWithChildren<IconMessageProps>) => {
  return (
    <Message
      icon={
        <span style={{ fontSize: 74 }}>
          <Icon fontSize="inherit" />
        </span>
      }
      {...rest}
    />
  );
};
