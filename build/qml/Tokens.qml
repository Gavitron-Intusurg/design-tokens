pragma Singleton
import QtQuick 2.15

QtObject {
    // Why 4: matches the base-unit convention in tokens/sizes.json
    readonly property int baseUnit: 4

    readonly property color colorPrimary100: "#E3F2FD"
    readonly property color colorPrimary200: "#90CAF9"
    readonly property color colorPrimary300: "#42A5F5"
    readonly property color colorPrimary400: "#1E88E5"
    readonly property color colorPrimary500: "#1565C0"
    readonly property color colorNeutral0: "#FFFFFF"
    readonly property color colorNeutral100: "#F5F5F5"
    readonly property color colorNeutral200: "#E0E0E0"
    readonly property color colorNeutral300: "#BDBDBD"
    readonly property color colorNeutral400: "#9E9E9E"
    readonly property color colorNeutral500: "#757575"
    readonly property color colorNeutral600: "#616161"
    readonly property color colorNeutral700: "#424242"
    readonly property color colorNeutral800: "#303030"
    readonly property color colorNeutral900: "#212121"
    readonly property color colorNeutral1000: "#000000"
    readonly property color colorContentPrimary: "#00ff00"
    readonly property color colorSuccess: "#4CAF50"
    readonly property color colorWarning: "#FF9800"
    readonly property color colorError: "#F44336"
    readonly property color colorInfo: "#2196F3"
    readonly property string fontFamilyPrimary: "Inter, sans-serif"
    readonly property string fontFamilyMono: "'JetBrains Mono', monospace"
    readonly property real fontWeightRegular: 400
    readonly property real fontWeightMedium: 500
    readonly property real fontWeightSemibold: 600
    readonly property real fontWeightBold: 700
    readonly property string fontSizeXs: "0.75rem"
    readonly property string fontSizeSm: "0.875rem"
    readonly property string fontSizeMd: "1rem"
    readonly property string fontSizeLg: "1.25rem"
    readonly property string fontSizeXl: "1.5rem"
    readonly property string fontSize2xl: "2rem"
    readonly property string fontSize3xl: "2.5rem"
    readonly property real fontLineHeightTight: 1.2
    readonly property real fontLineHeightNormal: 1.5
    readonly property real fontLineHeightRelaxed: 1.75
    readonly property string sizeBase: "4px"
    readonly property int sizeSpacing1x: 1 * baseUnit
    readonly property int sizeSpacing2x: 2 * baseUnit
    readonly property int sizeSpacing3x: 3 * baseUnit
    readonly property int sizeSpacing4x: 4 * baseUnit
    readonly property int sizeSpacing6x: 6 * baseUnit
    readonly property int sizeSpacing8x: 8 * baseUnit
    readonly property int sizeSpacing12x: 12 * baseUnit
    readonly property int sizeSpacing16x: 16 * baseUnit
    readonly property int sizeRadiusSm: 1 * baseUnit
    readonly property int sizeRadiusMd: 2 * baseUnit
    readonly property int sizeRadiusLg: 4 * baseUnit
    readonly property int sizeRadiusFull: 9999
}
