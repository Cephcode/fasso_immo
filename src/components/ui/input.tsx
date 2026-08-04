import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Octicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { forwardRef } from 'react';
import { Platform, TextInput, View } from 'react-native';

type InputProps = React.ComponentProps<typeof TextInput> & {
  leftIcon?: keyof typeof Octicons.glyphMap;
  variant?: 'default' | 'accent';
};

const Input = forwardRef<TextInput, InputProps>(
  ({ className, leftIcon, variant = 'default', style, ...props }, ref) => {
    const { colorScheme } = useColorScheme();
    const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;

    const isAccent = variant === 'accent';
    const textColor = isAccent ? colors.primaryForeground : colors.foreground;
    const iconColor = isAccent ? colors.primaryForeground : colors.mutedForeground;

    return (
      <View className="relative w-full justify-center bg-card-foreground rounded-full">
        {leftIcon && (
          <Octicons
            name={leftIcon}
            size={18}
            color={iconColor}
            style={{ position: 'absolute', left: 12, zIndex: 1 }}
          />
        )}
        <TextInput
          ref={ref}
          textAlignVertical="center"
          className={cn(
            'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-full border text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
            isAccent && 'border-transparent bg-primary text-primary-foreground dark:bg-primary',
            props.editable === false &&
              cn(
                'opacity-60',
                Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
              ),
            Platform.select({
              web: cn(
                'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
              ),
              native: 'placeholder:text-muted-foreground/50',
            }),
            className
          )}
          style={[{ paddingLeft: leftIcon ? 44 : 16, paddingRight: 16 }, { color: textColor }, style]}
          {...props}
        />
      </View>
    );
  }
);
Input.displayName = 'Input';

export { Input };
