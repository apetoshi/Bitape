import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export interface ButtonProps extends ChakraButtonProps {
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'solid', size = 'md', loading, children, ...props }: ButtonProps) {
  return (
    <ChakraButton
      variant={variant}
      size={size}
      loading={loading}
      {...props}
    >
      {children}
    </ChakraButton>
  );
} 