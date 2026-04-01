pragma Singleton
import QtQuick 2.15

QtObject {

    // --- Primitive sizes (multipliers of base unit) ---
    readonly property real base: 1  // 1 * base
    readonly property real semi: 0.5  // 0.5 * base
    readonly property real single: 1  // 1 * base
    readonly property real double: 2  // 2 * base
    readonly property real triple: 3  // 3 * base
    readonly property real quad: 4  // 4 * base
    readonly property real quint: 5  // 5 * base
    readonly property real sext: 6  // 6 * base
    readonly property real quarter: 0.25  // 0.25 * base
    readonly property real doublePlusQuarter: 2.25  // 2.25 * base
    readonly property real quadPlusSemi: 4.5  // 4.5 * base
    readonly property real eighth: 0.125  // 0.125 * base
    readonly property real quarterPlusEighth: 0.375  // 0.375 * base
    readonly property real sept: 7  // 7 * base
    readonly property real doublePlusSemi: 2.5  // 2.5 * base
    readonly property real singlePlusSemi: 1.5  // 1.5 * base

    // --- Alias & component sizes ---
    readonly property real padding: double
    readonly property real radiusSmall: double
    readonly property real radius: triple
    readonly property real paddingLarge: triple
    readonly property real radiusXSmall: single
    readonly property real icon: triple
    readonly property real iconSmall: double
    readonly property real iconLarge: quad
    readonly property real componentHeight: sext
    readonly property real paddingSmall: single
    readonly property real divider: quarter
    readonly property real componentHeightXSmall: triple
    readonly property real radiusLarge: quad
    readonly property real radiusXLarge: quint
    readonly property real componentHeightLarge: sept
    readonly property real dividerThin: eighth
    readonly property real paddingXSmall: semi
    readonly property real paddingXLarge: quad
    readonly property real radiusXxLarge: sext
    readonly property real border: quarter
    readonly property real componentHeightSmall: quint
    readonly property real borderThin: eighth
    readonly property real switchSizeSwitchPadding: quarterPlusEighth
    readonly property real switchSizeSwitchHandle: doublePlusQuarter
    readonly property real switchSizeSwitchWidth: quadPlusSemi
    readonly property real switchSizeSwitchHeight: triple
    readonly property real switchSizeSwitchRadius: radiusSmall
    readonly property real buttonSizeButtonPaddingBetween: paddingSmall
    readonly property real buttonSizeButtonHeight: componentHeight
    readonly property real buttonSizeButtonHeightLarge: componentHeightLarge
    readonly property real buttonSizeButtonPadding: paddingLarge
    readonly property real buttonSizeButtonRadius: radius
    readonly property real buttonSizeButtonHeightSmall: componentHeightSmall
    readonly property real buttonSizeButtonRadiusSmall: radiusXSmall
    readonly property real checkboxSizeCheckboxPaddingBetween: paddingSmall
    readonly property real checkboxSizeCheckboxSize: componentHeightXSmall
    readonly property real checkboxSizeCheckboxIconSize: icon
    readonly property real checkboxSizeCheckboxIconBorder: border
    readonly property real checkboxSizeCheckboxInputSize: doublePlusSemi
    readonly property real radioButtonSizeRadioButtonInputIconSize: doublePlusSemi
    readonly property real radioButtonSizeRadioButtonPaddingBetween: paddingSmall
    readonly property real radioButtonSizeRadioButtonBorder: border
    readonly property real radioButtonSizeRadioButtonInputIconActiveSize: singlePlusSemi
    readonly property real radioButtonSizeRadioButtonInputIconPadding: quarter
    readonly property real radioButtonSizeRadioButtonPaddingContentTop: eighth
    readonly property real radioButtonSizeRadioButtonInputIconRadius: radius
    readonly property real radioButtonSizeRadioButtonInputIconPaddingInner: semi
    readonly property real radioButtonSizeRadioButtonGroupPadding: padding
    readonly property real stepperSizeStepperPadding: paddingLarge
    readonly property real stepperSizeStepperButtonHeight: componentHeight
    readonly property real stepperSizeStepperRadius: radius
    readonly property real stepperSizeStepperDivider: divider
    readonly property real stepperSizeStepperInputHeight: componentHeight
    readonly property real stepperSizeStepperIcon: icon
    readonly property real stepperSizeStepperHeight: componentHeight
    readonly property real progressbarSizeProgressbarHeight: single
    readonly property real progressbarSizeProgressbarRadius: radiusSmall
    readonly property real progressbarSizeProgressbarPadding: paddingSmall
    readonly property real stackedRowSizeStackedRowPadding: padding
    readonly property real stackedRowSizeStackedRowHeight: componentHeight
    readonly property real stackedRowSizeStackedRowHeightLarge: componentHeightLarge
    readonly property real stackedRowSizeStackedRowPaddingBetween: paddingSmall
    readonly property real stackedRowSizeStackedRowIcon: icon
    readonly property real segmentedControlSizeSegmentedControlItemPadding: padding
    readonly property real segmentedControlSizeSegmentedControlHeight: componentHeight
    readonly property real segmentedControlSizeSegmentedControlHeightLarge: componentHeightLarge
    readonly property real segmentedControlSizeSegmentedControlIcon: icon
    readonly property real segmentedControlSizeSegmentedControlPadding: paddingXSmall
    readonly property real segmentedControlSizeSegmentedControlItemRadius: doublePlusSemi
    readonly property real segmentedControlSizeSegmentedControlRadius: radius
    readonly property real segmentedControlSizeSegmentedControlItemHeight: componentHeightSmall
    readonly property real segmentedControlSizeSegmentedControlItemHeightLarge: componentHeight
    readonly property real sliderSizeSliderHeight: componentHeight
    readonly property real sliderSizeSliderHandleHeight: componentHeightXSmall
    readonly property real sliderSizeSliderHandleWidth: semi
    readonly property real sliderSizeSliderActiveBarPadding: padding
    readonly property real sliderSizeSliderTrackRadius: radius
    readonly property real sliderSizeSliderHeightLarge: componentHeightLarge
    readonly property real sliderSizeSliderContentPadding: paddingXLarge
    readonly property real sliderSizeSliderIcon: icon
    readonly property real sliderSizeSliderContentPaddingBetween: paddingSmall
    readonly property real sliderSizeSliderActiveBarRadius: doublePlusSemi
    readonly property real sliderSizeSliderTrackPadding: paddingXSmall
    readonly property real sliderSizeSliderActiveBarHeight: componentHeightSmall
    readonly property real sliderSizeSliderActiveBarHeightLarge: componentHeight
    readonly property real stackSizeStackPadding: paddingSmall
    readonly property real stackSizeStackRadius: radiusXLarge
    readonly property real stackSizeStackDivider: divider
    readonly property real dropdownSizeDropdownInputPadding: padding
    readonly property real dropdownSizeDropdownInputHeight: componentHeight
    readonly property real dropdownSizeDropdownInputPaddingBetween: paddingSmall
    readonly property real dropdownSizeDropdownInputIcon: icon
    readonly property real dropdownSizeDropdownInputRadius: radius
    readonly property real dropdownSizeDropdownPadding: paddingSmall
    readonly property real dropdownSizeDropdownInputBorder: border
    readonly property real dropdownMenuSizeDropdownMenuOptionPadding: padding
    readonly property real dropdownMenuSizeDropdownMenuOptionHeight: componentHeightSmall
    readonly property real dropdownMenuSizeDropdownMenuOptionPaddingBetween: paddingSmall
    readonly property real dropdownMenuSizeDropdownMenuOptionIcon: icon
    readonly property real dropdownMenuSizeDropdownMenuRadius: radius
    readonly property real dropdownMenuSizeDropdownMenuPadding: paddingSmall
    readonly property real dropdownMenuSizeDropdownMenuScrollbarRadius: radiusXSmall
    readonly property real dropdownMenuSizeDropdownMenuScrollbarWidth: single
    readonly property real textInputSizeTextInputInputPadding: padding
    readonly property real textInputSizeTextInputInputHeight: componentHeight
    readonly property real textInputSizeTextInputInputPaddingBetween: paddingSmall
    readonly property real textInputSizeTextInputPadding: paddingSmall
    readonly property real textInputSizeTextInputInputRadius: radius
    readonly property real textInputSizeTextInputInputIcon: icon
    readonly property real textInputSizeTextInputInputBorder: border
    readonly property real rotationSliderSizeRotationSliderHeight: componentHeight
    readonly property real rotationSliderSizeRotationSliderTickHeightLarge: quad
    readonly property real rotationSliderSizeRotationSliderTickWidthLarge: semi
    readonly property real rotationSliderSizeRotationSliderPadding: padding
    readonly property real rotationSliderSizeRotationSliderRadius: radiusSmall
    readonly property real rotationSliderSizeRotationSliderTickPadding: paddingSmall
    readonly property real rotationSliderSizeRotationSliderTickHeightSmall: componentHeightXSmall
    readonly property real rotationSliderSizeRotationSliderTickWidthSmall: divider
    readonly property real rotationSliderSizeRotationSliderTickHeightXlarge: componentHeightSmall
    readonly property real rotationSliderSizeRotationSliderTickWidthXlarge: single
    readonly property real rotationSliderSizeRotationSliderTickRadius: radiusXSmall
    readonly property real rotationSliderSizeRotationSliderHeightLarge: componentHeightLarge
    readonly property real sliceSliderSizeSliceSliderWidth: componentHeight
    readonly property real sliceSliderSizeSliceSliderTickWidthXsmall: componentHeightXSmall
    readonly property real sliceSliderSizeSliceSliderTickHeightXsmall: divider
    readonly property real sliceSliderSizeSliceSliderPadding: padding
    readonly property real sliceSliderSizeSliceSliderRadius: radius
    readonly property real sliceSliderSizeSliceSliderTickPadding: paddingSmall
    readonly property real sliceSliderSizeSliceSliderTickBorder: border
    readonly property real sliceSliderSizeSliceSliderTickWidthSmall: quad
    readonly property real sliceSliderSizeSliceSliderTickHeightSmall: semi
    readonly property real sliceSliderSizeSliceSliderTickWidthLarge: componentHeightSmall
    readonly property real sliceSliderSizeSliceSliderTickHeightLarge: single
    readonly property real sliceSliderSizeSliceSliderWidthLarge: componentHeightLarge
    readonly property real sliceSliderSizeSliceSliderTickRadius: radiusXSmall
    readonly property real sliceSliderSizeSliceSliderTickWidthXlarge: componentHeightSmall
    readonly property real sliceSliderSizeSliceSliderTickHeightXlarge: singlePlusSemi
    readonly property real stepindicationSizeStepindicatorHeightSmall: semi
    readonly property real stepindicationSizeStepindicatorGapSmall: divider
    readonly property real stepindicationSizeStepindicatorRadiusSmall: radiusXSmall
    readonly property real stepindicationSizeStepindicatorHeightLarge: single
    readonly property real stepindicationSizeStepindicatorGapLarge: paddingXSmall
    readonly property real stepindicationSizeStepindicatorWidthActiveLarge: quad
    readonly property real stepindicationSizeStepindicatorWidthInactiveLarge: double
    readonly property real cardSizeCardPadding: padding
    readonly property real cardSizeCardContentPadding: paddingSmall
    readonly property real cardSizeCardContentPaddingBetween: paddingXSmall
    readonly property real cardSizeCardRadius: radiusLarge
    readonly property real cardSizeCardContentRadius: radiusSmall
    readonly property real cardSizeCardBorder: border
    readonly property real dialogSizeDialogRadius: radiusXxLarge
    readonly property real dialogSizeDialogPadding: paddingLarge
    readonly property real dialogSizeDialogIcon: icon
    readonly property real dialogSizeDialogMediaRadius: radius
    readonly property real dialogSizeDialogPaddingBetween: padding
    readonly property real dialogSizeDialogIconContainer: componentHeightSmall
    readonly property real dialogSizeDialogBorder: borderThin
    readonly property real dialogSizeDialogIconContainerRadius: radius
    readonly property real notificationSizeNotificationRadius: radius
    readonly property real notificationSizeNotificationBorder: borderThin
    readonly property real notificationSizeNotificationIconContainerRadius: radiusXSmall
    readonly property real notificationSizeNotificationPadding: padding
    readonly property real notificationSizeNotificationPaddingBetween: paddingSmall
    readonly property real notificationSizeNotificationIcon: icon
    readonly property real notificationSizeNotificationIconContainer: componentHeightSmall
    readonly property real popoverSizePopoverRadius: radiusXLarge
    readonly property real popoverSizePopoverPadding: padding
    readonly property real popoverSizePopoverIcon: icon
    readonly property real popoverSizePopoverPaddingBetween: paddingSmall
    readonly property real popoverSizePopoverBorder: border
    readonly property real globalBarSizeGlobalBarHeight: componentHeight
    readonly property real globalBarSizeGlobalBarPadding: paddingSmall
    readonly property real globalBarSizeGlobalBarButtonBorder: border
    readonly property real viewBoxSizeViewBoxRadius: radius
    readonly property real viewBoxSizeViewBoxPadding: paddingSmall
    readonly property real viewBoxSizeViewBoxBorder: borderThin
    readonly property real viewBoxSizeViewBoxStatusBannerHeightSmall: componentHeightSmall
    readonly property real viewBoxSizeViewBoxStatusBannerPaddingSmall: paddingSmall
    readonly property real viewBoxSizeViewBoxStatusBannerPaddingBetween: paddingXSmall
    readonly property real viewBoxSizeViewBoxStatusBannerHeight: componentHeight
    readonly property real viewBoxSizeViewBoxStatusBannerPadding: padding
    readonly property real viewBoxSizeViewBoxBannerHeight: componentHeightXSmall
    readonly property real viewBoxSizeViewBoxBannerPadding: padding
    readonly property real viewBoxSizeViewBoxBannerRadius: radiusSmall
    readonly property real viewCollectionSizeViewCollectionPadding: padding
    readonly property real viewCollectionSizeViewCollectionPaddingBetween: paddingSmall
    readonly property real workflowSizeWokflowPanelPadding: padding
    readonly property real workflowSizeWokflowPanelPaddingXLarge: paddingXLarge
    readonly property real workflowSizeWokflowPanelPaddingBetween: paddingSmall
    readonly property real workflowSizeWokflowPanelBorder: borderThin
    readonly property real workflowSizeWokflowPanelRadius: radiusXLarge
    readonly property real markerSizeMarkerObjectContainerHeight: componentHeightSmall
    readonly property real markerSizeMarkerContainerHeight: componentHeightLarge
    readonly property real markerSizeMarkerContainerInnerPadding: paddingSmall
    readonly property real markerSizeMarkerContainerBorder: border
    readonly property real markerSizeMarkerObjectBorder: border
    readonly property real markerSizeMarkerContainerRadius: radiusSmall
    readonly property real markerSizeMarkerObjectHeight: quad
    readonly property real markerSizeMarkerObjectBorderThin: borderThin
    readonly property real markerSizeMarkerHandleHeight: single
    readonly property real markerSizeMarkerObjectBorderThick: semi
    readonly property real loaderSizeLoaderObjectRadius: radiusSmall
    readonly property real dataCardSizeDataCardPaddingSmall: paddingXSmall
    readonly property real dataCardSizeDataCardPadding: padding
}
