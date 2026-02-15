/**
 * SWITCH/TOGGLE COMPONENT - PRODUCTION READY
 * 
 * COMPLETE IMPLEMENTATION: Toggle switches for settings
 * NO PLACEHOLDERS - Works immediately
 */

import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  showIcons?: boolean;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  loading = false,
  size = 'md',
  label,
  description,
  showIcons = false,
  className,
  id,
}: SwitchProps) {
  const isDisabled = disabled || loading;

  // Size classes
  const sizeClasses = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
      iconSize: 'w-3 h-3',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
      iconSize: 'w-3.5 h-3.5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      iconSize: 'w-4 h-4',
    },
  };

  const sizes = sizeClasses[size];

  const handleToggle = () => {
    if (!isDisabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const switchElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={isDisabled}
      aria-labelledby={label && id ? `${id}-label` : undefined}
      aria-describedby={description && id ? `${id}-description` : undefined}
      disabled={isDisabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex flex-shrink-0 rounded-full',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        sizes.track,
        checked
          ? 'bg-blue-600'
          : 'bg-gray-200 dark:bg-gray-700',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'cursor-pointer',
        className
      )}
    >
      {/* Thumb */}
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full',
          'bg-white shadow-lg ring-0',
          'transform transition-transform duration-200 ease-in-out',
          'flex items-center justify-center',
          sizes.thumb,
          checked ? sizes.translate : 'translate-x-0.5'
        )}
      >
        {loading ? (
          <Loader2 className={cn('animate-spin text-gray-400', sizes.iconSize)} />
        ) : showIcons ? (
          checked ? (
            <Check className={cn('text-blue-600', sizes.iconSize)} />
          ) : (
            <X className={cn('text-gray-400', sizes.iconSize)} />
          )
        ) : null}
      </span>
    </button>
  );

  // If no label, return just the switch
  if (!label && !description) {
    return switchElement;
  }

  // Return switch with label
  return (
    <div className="flex items-start gap-3">
      {switchElement}
      <div className="flex-1">
        {label && (
          <label
            id={id ? `${id}-label` : undefined}
            htmlFor={id}
            className={cn(
              'block text-sm font-medium',
              'text-gray-900 dark:text-gray-100',
              !isDisabled && 'cursor-pointer'
            )}
            onClick={!isDisabled ? handleToggle : undefined}
          >
            {label}
          </label>
        )}
        {description && (
          <p
            id={id ? `${id}-description` : undefined}
            className="text-sm text-gray-600 dark:text-gray-400 mt-0.5"
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Switch Group - Multiple switches in a list
 */
export interface SwitchGroupProps {
  items: Array<{
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SwitchGroup({ items, size = 'md', className }: SwitchGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => (
        <Switch
          key={item.id}
          id={item.id}
          label={item.label}
          description={item.description}
          checked={item.checked}
          onChange={item.onChange}
          disabled={item.disabled}
          size={size}
        />
      ))}
    </div>
  );
}

/**
 * REAL USAGE EXAMPLES
 */

// Example 1: Basic switch
// const [enabled, setEnabled] = useState(false);
// <Switch checked={enabled} onChange={setEnabled} />

// Example 2: Switch with label
// <Switch
//   checked={notifications}
//   onChange={setNotifications}
//   label="Enable notifications"
//   description="Receive email updates about your transactions"
// />

// Example 3: Different sizes
// <div className="space-y-4">
//   <Switch checked={value} onChange={setValue} size="sm" label="Small" />
//   <Switch checked={value} onChange={setValue} size="md" label="Medium" />
//   <Switch checked={value} onChange={setValue} size="lg" label="Large" />
// </div>

// Example 4: With icons
// <Switch
//   checked={enabled}
//   onChange={setEnabled}
//   showIcons
//   label="Feature enabled"
// />

// Example 5: Loading state
// <Switch
//   checked={enabled}
//   onChange={handleToggle}
//   loading={isLoading}
//   label="Saving..."
// />

// Example 6: Disabled switch
// <Switch
//   checked={true}
//   onChange={() => {}}
//   disabled
//   label="This setting is locked"
//   description="Contact support to change this setting"
// />

// Example 7: Settings panel
// function SettingsPanel() {
//   const [settings, setSettings] = useState({
//     notifications: true,
//     darkMode: false,
//     analytics: true,
//   });
//   
//   return (
//     <div className="space-y-6">
//       <div>
//         <h3 className="text-lg font-semibold mb-4">Preferences</h3>
//         <div className="space-y-4">
//           <Switch
//             checked={settings.notifications}
//             onChange={(checked) =>
//               setSettings({ ...settings, notifications: checked })
//             }
//             label="Email notifications"
//             description="Receive updates about your account activity"
//           />
//           <Switch
//             checked={settings.darkMode}
//             onChange={(checked) =>
//               setSettings({ ...settings, darkMode: checked })
//             }
//             label="Dark mode"
//             description="Use dark theme across the application"
//           />
//           <Switch
//             checked={settings.analytics}
//             onChange={(checked) =>
//               setSettings({ ...settings, analytics: checked })
//             }
//             label="Analytics"
//             description="Help us improve by sharing usage data"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// Example 8: Switch Group
// <SwitchGroup
//   items={[
//     {
//       id: 'email',
//       label: 'Email notifications',
//       description: 'Receive email updates',
//       checked: settings.email,
//       onChange: (checked) => updateSetting('email', checked),
//     },
//     {
//       id: 'push',
//       label: 'Push notifications',
//       description: 'Receive push notifications',
//       checked: settings.push,
//       onChange: (checked) => updateSetting('push', checked),
//     },
//     {
//       id: 'sms',
//       label: 'SMS notifications',
//       description: 'Receive SMS updates',
//       checked: settings.sms,
//       onChange: (checked) => updateSetting('sms', checked),
//       disabled: !hasPremium,
//     },
//   ]}
// />

// Example 9: With API integration
// function NotificationToggle() {
//   const [enabled, setEnabled] = useState(user.notifications);
//   const [loading, setLoading] = useState(false);
//   
//   const handleToggle = async (checked: boolean) => {
//     setLoading(true);
//     try {
//       await updateUserSettings({ notifications: checked });
//       setEnabled(checked);
//       toast.success('Settings updated');
//     } catch (error) {
//       toast.error('Failed to update settings');
//     } finally {
//       setLoading(false);
//     }
//   };
//   
//   return (
//     <Switch
//       checked={enabled}
//       onChange={handleToggle}
//       loading={loading}
//       label="Email notifications"
//     />
//   );
// }

// Example 10: Form integration
// <form onSubmit={handleSubmit}>
//   <div className="space-y-4">
//     <Switch
//       checked={formData.isPublic}
//       onChange={(checked) =>
//         setFormData({ ...formData, isPublic: checked })
//       }
//       label="Make transaction public"
//       description="Allow others to view this transaction"
//     />
//     <Switch
//       checked={formData.autoRelease}
//       onChange={(checked) =>
//         setFormData({ ...formData, autoRelease: checked })
//       }
//       label="Auto-release funds"
//       description="Automatically release funds after 7 days"
//     />
//   </div>
//   <Button type="submit">Save Settings</Button>
// </form>
