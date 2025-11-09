import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// ثبت فونت فارسی
Font.register({
  family: "Vazir",
  src: "https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/Vazir-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Vazir",
    direction: "rtl",
  },
  header: {
    marginBottom: 30,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "#1f2937",
  },
  date: {
    fontSize: 12,
    color: "#6b7280",
  },
  chartSection: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    color: "#1f2937",
  },
  chartImage: {
    width: "100%",
    height: 200,
    objectFit: "contain",
  },
  row: {
    flexDirection: "row-reverse",
    gap: 15,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#9ca3af",
  },
});

const ReportPDF = ({ chartImages }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* هدر */}
        <View style={styles.header}>
          <Text style={styles.title}>گزارش نمودارهای باشگاه</Text>
          <Text style={styles.date}>
            تاریخ: {new Date().toLocaleDateString("fa-IR")}
          </Text>
        </View>

        {/* نمودارها - ردیف اول */}
        <View style={styles.row}>
          {chartImages.memberType && (
            <View style={styles.column}>
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>توزیع نوع اعضا</Text>
                <Image src={chartImages.memberType} style={styles.chartImage} />
              </View>
            </View>
          )}
          {chartImages.memberLevel && (
            <View style={styles.column}>
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>توزیع سطح عضویت</Text>
                <Image
                  src={chartImages.memberLevel}
                  style={styles.chartImage}
                />
              </View>
            </View>
          )}
        </View>

        {/* نمودارها - ردیف دوم */}
        <View style={styles.row}>
          {chartImages.income && (
            <View style={styles.column}>
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>درآمد به تفکیک دسته‌بندی</Text>
                <Image src={chartImages.income} style={styles.chartImage} />
              </View>
            </View>
          )}
          {chartImages.expense && (
            <View style={styles.column}>
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>هزینه به تفکیک دسته‌بندی</Text>
                <Image src={chartImages.expense} style={styles.chartImage} />
              </View>
            </View>
          )}
        </View>

        {/* فوتر */}
        <Text style={styles.footer}>تولید شده توسط سیستم مدیریت باشگاه</Text>
      </Page>
    </Document>
  );
};

export default ReportPDF;
