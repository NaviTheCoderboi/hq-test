#include "fs.h"

namespace fs {

std::filesystem::path getDataDirectory() {
#ifdef _WIN32
    char* appData{std::getenv("APPDATA")};
    if (appData)
        return std::filesystem::path(appData);

    return std::filesystem::temp_directory_path();
#elif __APPLE__
    char* home{std::getenv("HOME")};
    if (home)
        return std::filesystem::path(home);

    return std::filesystem::temp_directory_path();
#else
    char* home{std::getenv("HOME")};
    if (home) {
        std::filesystem::path localShare{std::filesystem::path(home) / ".local" / "share"};
        if (std::filesystem::exists(localShare))
            return localShare;

        return std::filesystem::path(home);
    }

    return std::filesystem::temp_directory_path();
#endif
}

} // namespace fs