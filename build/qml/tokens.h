#pragma once

#include <QString>
#include <QColor>

namespace DesignTokens {

constexpr int BASE_UNIT = 4;

inline const QColor COLORPRIMARY100 = QColor("#E3F2FD");
inline const QColor COLORPRIMARY200 = QColor("#90CAF9");
inline const QColor COLORPRIMARY300 = QColor("#42A5F5");
inline const QColor COLORPRIMARY400 = QColor("#1E88E5");
inline const QColor COLORPRIMARY500 = QColor("#1565C0");
inline const QColor COLORNEUTRAL0 = QColor("#FFFFFF");
inline const QColor COLORNEUTRAL100 = QColor("#F5F5F5");
inline const QColor COLORNEUTRAL200 = QColor("#E0E0E0");
inline const QColor COLORNEUTRAL300 = QColor("#BDBDBD");
inline const QColor COLORNEUTRAL400 = QColor("#9E9E9E");
inline const QColor COLORNEUTRAL500 = QColor("#757575");
inline const QColor COLORNEUTRAL600 = QColor("#616161");
inline const QColor COLORNEUTRAL700 = QColor("#424242");
inline const QColor COLORNEUTRAL800 = QColor("#303030");
inline const QColor COLORNEUTRAL900 = QColor("#212121");
inline const QColor COLORNEUTRAL1000 = QColor("#000000");
inline const QColor COLORCONTENTPRIMARY = QColor("#00ff00");
inline const QColor COLORSUCCESS = QColor("#4CAF50");
inline const QColor COLORWARNING = QColor("#FF9800");
inline const QColor COLORERROR = QColor("#F44336");
inline const QColor COLORINFO = QColor("#2196F3");
inline const QString FONTFAMILYPRIMARY = QStringLiteral("Inter, sans-serif");
inline const QString FONTFAMILYMONO = QStringLiteral("'JetBrains Mono', monospace");
constexpr double FONTWEIGHTREGULAR = 400;
constexpr double FONTWEIGHTMEDIUM = 500;
constexpr double FONTWEIGHTSEMIBOLD = 600;
constexpr double FONTWEIGHTBOLD = 700;
inline const QString FONTSIZEXS = QStringLiteral("0.75rem");
inline const QString FONTSIZESM = QStringLiteral("0.875rem");
inline const QString FONTSIZEMD = QStringLiteral("1rem");
inline const QString FONTSIZELG = QStringLiteral("1.25rem");
inline const QString FONTSIZEXL = QStringLiteral("1.5rem");
inline const QString FONTSIZE2XL = QStringLiteral("2rem");
inline const QString FONTSIZE3XL = QStringLiteral("2.5rem");
constexpr double FONTLINEHEIGHTTIGHT = 1.2;
constexpr double FONTLINEHEIGHTNORMAL = 1.5;
constexpr double FONTLINEHEIGHTRELAXED = 1.75;
inline const QString SIZEBASE = QStringLiteral("4px");
constexpr int SIZESPACING1X = 1 * BASE_UNIT;
constexpr int SIZESPACING2X = 2 * BASE_UNIT;
constexpr int SIZESPACING3X = 3 * BASE_UNIT;
constexpr int SIZESPACING4X = 4 * BASE_UNIT;
constexpr int SIZESPACING6X = 6 * BASE_UNIT;
constexpr int SIZESPACING8X = 8 * BASE_UNIT;
constexpr int SIZESPACING12X = 12 * BASE_UNIT;
constexpr int SIZESPACING16X = 16 * BASE_UNIT;
constexpr int SIZERADIUSSM = 1 * BASE_UNIT;
constexpr int SIZERADIUSMD = 2 * BASE_UNIT;
constexpr int SIZERADIUSLG = 4 * BASE_UNIT;
constexpr int SIZERADIUSFULL = 9999;

} // namespace DesignTokens
