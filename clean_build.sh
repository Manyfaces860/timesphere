# 1. Step into the android directory
cd android

# 2. Hard erase previous cached build trees
rm -rf app/build
rm -rf .gradle

# 3. Clean the standard gradle distribution cache
./gradlew clean
./gradlew generateCodegenArtifactsFromSchema
# 4. Step back to your project root workspace

# 5. Compile and boot the app using your default config
./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a
cd ..