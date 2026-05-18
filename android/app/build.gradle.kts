import org.gradle.api.Project

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.compose.compiler)
}

fun Project.tcProp(name: String): String =
    (this.findProperty(name) as String?)?.trim().orEmpty()

fun String.escapeForBuildConfig(): String =
    "\"" + replace("\\", "\\\\").replace("\"", "\\\"") + "\""

android {
    namespace = "com.mobilenext.milliways"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mobilenext.milliways"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        val defaultApi = "http://10.0.2.2:3001"
        buildConfigField("String", "MILLIWAYS_API_BASE_URL", "\"$defaultApi\"")

        val tcProjectId = project.tcProp("TESTCHIMP_PROJECT_ID")
        val tcApiKey = project.tcProp("TESTCHIMP_API_KEY")
        val tcBackend =
            project.tcProp("TESTCHIMP_BACKEND_URL").ifEmpty { "https://featureservice-staging.testchimp.io" }
        buildConfigField("String", "TESTCHIMP_PROJECT_ID", tcProjectId.escapeForBuildConfig())
        buildConfigField("String", "TESTCHIMP_API_KEY", tcApiKey.escapeForBuildConfig())
        buildConfigField("String", "TESTCHIMP_BACKEND_URL", tcBackend.escapeForBuildConfig())
        // Match iOS Debug `TESTCHIMP_ENV` (see project.pbxproj); release overrides below.
        buildConfigField("String", "TESTCHIMP_ENV", "\"staging\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            buildConfigField("String", "TESTCHIMP_ENV", "\"production\"")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    // JitPack: https://jitpack.io/#testchimphq/testchimp-rum-android/0.1.8 (TrueCoverage set on caller thread; v1/flush).
    implementation("com.github.testchimphq:testchimp-rum-android:0.1.8")
    implementation(platform(libs.compose.bom))
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.process)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.compose.ui)
    implementation(libs.compose.ui.graphics)
    implementation(libs.compose.ui.tooling.preview)
    implementation(libs.compose.material3)
    implementation(libs.compose.material.icons)
    implementation(libs.okhttp)
    implementation(libs.kotlinx.serialization.json)
    debugImplementation("androidx.compose.ui:ui-tooling")
}
