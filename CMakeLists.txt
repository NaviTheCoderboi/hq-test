# Basic config
cmake_minimum_required(VERSION 4.0 )

set(PROJECT_NAME "TheHQProject")
set(PROJECT_VERSION "1.0.0")
project(${PROJECT_NAME})

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(SRC_DIR backend)
set(INCLUDE_DIR "include")

add_executable(${PROJECT_NAME} ${SRC_DIR}/main.cpp)

file(GLOB_RECURSE SRC_FILES ${SRC_DIR}/*.cpp)
file(GLOB_RECURSE HEADER_FILES ${INCLUDE_DIR}/*.h ${INCLUDE_DIR}/*.hpp)

target_sources(${PROJECT_NAME} PRIVATE ${SRC_FILES} ${HEADER_FILES})
target_include_directories(${PROJECT_NAME} PRIVATE ${INCLUDE_DIR})

# Dependencies
include(cmake/CPM.cmake)

CPMAddPackage(
    NAME           saucer
    VERSION        7.0.0
    GIT_REPOSITORY "https://github.com/saucer/saucer"
)

target_link_libraries(${PROJECT_NAME} PRIVATE saucer::saucer)

saucer_embed("dist")

target_link_libraries(${PROJECT_NAME} PRIVATE saucer::saucer saucer::embedded)

set(SQLITE3_DIR "${CMAKE_SOURCE_DIR}/external/sqlite3")
set(SQLITE3_SOURCES
    ${SQLITE3_DIR}/sqlite3.c
)

add_library(sqlite3 STATIC ${SQLITE3_SOURCES})
target_include_directories(sqlite3 PUBLIC ${SQLITE3_DIR})
target_link_libraries(${PROJECT_NAME} PRIVATE sqlite3)

# Packaging
if (WIN32)
    set(APP_ICON_RESOURCE "${CMAKE_SOURCE_DIR}/appIcon.rc")
    target_sources(${PROJECT_NAME} PRIVATE ${APP_ICON_RESOURCE})
endif()

install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION "bin"
    COMPONENT application
)

install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/dist
    DESTINATION share/${PROJECT_NAME}
    COMPONENT resources
    OPTIONAL
)

if (EXISTS "${CMAKE_SOURCE_DIR}/LICENSE")
    install(FILES "${CMAKE_SOURCE_DIR}/LICENSE"
            DESTINATION share/licenses/${PROJECT_NAME})
endif()

set(CPACK_PACKAGE_NAME ${PROJECT_NAME})
set(CPACK_PACKAGE_VENDOR "NaviTheCoderboi")
set(CPACK_PACKAGE_CONTACT "https://github.com/NaviTheCoderboi")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "a study time tracker application")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_INSTALL_DIRECTORY ${PROJECT_NAME})

set(CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/LICENSE")

if (WIN32)
    set(CPACK_GENERATOR "ZIP;NSIS")

    set(CPACK_NSIS_DISPLAY_NAME "${PROJECT_NAME}")
    set(CPACK_NSIS_HELP_LINK "https://github.com/saucer/saucer")
    set(CPACK_NSIS_URL_INFO_ABOUT "https://github.com/saucer/saucer")
    set(CPACK_NSIS_CONTACT "${CPACK_PACKAGE_CONTACT}")
    set(CPACK_NSIS_MODIFY_PATH ON)
    set(CPACK_NSIS_ENABLE_UNINSTALL_BEFORE_INSTALL ON)

    set(CPACK_NSIS_EXTRA_PREINSTALL_COMMANDS "
        ; Check if WebView2 is installed
        ClearErrors
        ReadRegStr $0 HKLM 'SOFTWARE\\\\WOW6432Node\\\\Microsoft\\\\EdgeUpdate\\\\Clients\\\\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}' 'pv'
        IfErrors webview2_missing webview2_ok
        
        webview2_missing:
            MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION 'Warning: Microsoft Edge WebView2 Runtime is not installed.$\\n$\\n${PROJECT_NAME} requires WebView2 to run.$\\n$\\nClick OK to continue installation (you can install WebView2 later).$\\nClick Cancel to abort installation.' IDOK continue IDCANCEL abort
            abort:
                Abort 'Installation cancelled by user.'
            continue:
                DetailPrint 'WebView2 not found - user will need to install manually'
                Goto done
        
        webview2_ok:
            DetailPrint 'WebView2 Runtime detected (version $0)'
        
        done:
    ")

    set(CPACK_NSIS_MUI_FINISHPAGE_RUN_TEXT "Launch ${PROJECT_NAME}")
    set(CPACK_NSIS_EXTRA_INSTALL_COMMANDS "
        WriteINIStr '$INSTDIR\\\\webview2_info.url' 'InternetShortcut' 'URL' 'https://go.microsoft.com/fwlink/p/?LinkId=2124703'
    ")

    set(CPACK_NSIS_MUI_ICON "${CMAKE_SOURCE_DIR}/assets/logo.ico")
    set(CPACK_NSIS_MUI_UNIICON "${CMAKE_SOURCE_DIR}/assets/logo.ico")

    set(CPACK_NSIS_MENU_LINKS "${PROJECT_NAME}" "${PROJECT_NAME}")

    set(CPACK_NSIS_CREATE_ICONS_EXTRA
        "CreateShortCut \\\"$DESKTOP\\\\${PROJECT_NAME}.lnk\\\" \\\"$INSTDIR\\\\${PROJECT_NAME}.exe\\\"")
    set(CPACK_NSIS_DELETE_ICONS_EXTRA
        "Delete \\\"$DESKTOP\\\\${PROJECT_NAME}.lnk\\\"")
elseif(APPLE)
    set(CPACK_GENERATOR "DragNDrop")
    set(CPACK_DMG_VOLUME_NAME "${PROJECT_NAME}")

else()
    set(CPACK_GENERATOR "TGZ")
endif()

include(CPack)