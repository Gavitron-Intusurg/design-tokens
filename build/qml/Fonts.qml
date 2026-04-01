pragma Singleton
import QtQuick 2.15

QtObject {

    // --- Font families ---
    readonly property string familyInter: "Inter"
    readonly property string familyBrown: "IntuitiveBrownPro"
    readonly property string familyGtpressura: "GTPressuraPro"

    // --- Type scale parameters ---
    readonly property real scaleStepMultiplier: 0.125
    readonly property real scaleBodyLineHeightMultiplier: 0.33
    readonly property real scaleHeadlineLineHeightMultiplier: 0.2
    readonly property real scaleDisplayLineHeightMultiplier: 0.16

    // --- Font size steps ---
    readonly property real sizeMicro: -3  // Step -3. Line height category: body
    readonly property real sizeHelper: -2  // Step -2. Line height category: body
    readonly property real sizeCaption: -1  // Step -1. Line height category: body
    readonly property real sizeBody: 0  // Step 0 (base). Line height category: body
    readonly property real sizeSubtitle: 2  // Step 2. Line height category: body
    readonly property real sizeH4: 4  // Step 4. Line height category: headline
    readonly property real sizeH3: 6  // Step 6. Line height category: headline
    readonly property real sizeH2: 8  // Step 8. Line height category: headline
    readonly property real sizeH1: 10  // Step 10. Line height category: headline
    readonly property real sizeDisplay2: 13  // Step 13. Line height category: display
    readonly property real sizeDisplay1: 23  // Step 23. Line height category: display

    // --- Typefaces ---
    readonly property string typefaceMicro: familyInter  // Inter Regular
    readonly property string typefaceHelper: familyInter  // Inter Regular
    readonly property string typefaceCaption: familyInter  // Inter Regular, Inter Semibold
    readonly property string typefaceBody: familyInter  // Inter Regular, Inter Semibold
    readonly property string typefaceSubtitle: familyInter  // Inter Regular, Inter Semibold
    readonly property string typefaceH4: familyBrown  // Brown Pro Bold, GT Pressura Mono Regular
    readonly property string typefaceH3: familyBrown  // Brown Pro Bold, GT Pressura Mono Regular
    readonly property string typefaceH2: familyBrown  // Brown Pro Bold, GT Pressura Mono Regular
    readonly property string typefaceH1: familyBrown  // Brown Pro Bold, GT Pressura Mono Regular
    readonly property string typefaceDisplay2: familyBrown  // Brown Pro Bold, GT Pressura Mono Regular
    readonly property string typefaceDisplay1: familyBrown  // Brown Pro Bold, GT Pressura Mono Regular
}
