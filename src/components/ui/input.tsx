import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Octicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { forwardRef } from 'react';
import { Platform, TextInput, View } from 'react-native';

type InputProps = React.ComponentProps<typeof TextInput> & {
  leftIcon?: keyof typeof Octicons.glyphMap;
};

const Input = forwardRef<TextInput, InputProps>(
  ({ className, leftIcon, style, ...props }, ref) => {
    const { colorScheme } = useColorScheme();
    const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;

    return (
      <View className="relative w-full justify-center">
        {leftIcon && (
          <Octicons
            name={leftIcon}
            size={18}
            color={colors.mutedForeground}
            style={{ position: 'absolute', left: 14, zIndex: 1 }}
          />
        )}
        <TextInput
          ref={ref}
          className={cn(
            'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-full border text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
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
          style={[
            leftIcon ? { paddingLeft: 40 } : undefined,
            style, // permet de override si besoin depuis l'extérieur
          ]}
          {...props}
        />
      </View>
    );
  }
);
Input.displayName = 'Input';

export { Input };
