# Basic config
cmake_minimum_required(VERSION 4.0 )

set(CMAKE_C_COMPILER "/usr/bin/clang" CACHE STRING "C compiler" FORCE)
set(CMAKE_CXX_COMPILER "/usr/bin/clang++" CACHE STRING "C++ compiler" FORCE)

set(PROJECT_NAME "TheHQProject")
set(PROJECT_VERSION "1.0.0")
project(${PROJECT_NAME})

set(CMAKE_CXX_STANDARD 26)
set(CMAKE_CXX_EXTENSIONS ON)
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
    RUNTIME DESTINATION .
)

if (EXISTS "${CMAKE_SOURCE_DIR}/LICENSE")
    install(FILES "${CMAKE_SOURCE_DIR}/LICENSE"
            DESTINATION share/licenses/TheHQProject)
endif()

set(CPACK_PACKAGE_NAME "TheHQProject")
set(CPACK_PACKAGE_VENDOR "NaviTheCoderboi")
set(CPACK_PACKAGE_CONTACT "https://github.com/NaviTheCoderboi")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "a study time tracker application")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_INSTALL_DIRECTORY "TheHQProject")

set(CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/LICENSE")

if (WIN32)
    set(CPACK_GENERATOR "ZIP;NSIS")

    set(CPACK_NSIS_DISPLAY_NAME "MyWallet")
    set(CPACK_NSIS_HELP_LINK "https://github.com/saucer/saucer")
    set(CPACK_NSIS_URL_INFO_ABOUT "https://github.com/saucer/saucer")
    set(CPACK_NSIS_CONTACT "${CPACK_PACKAGE_CONTACT}")
    set(CPACK_NSIS_MODIFY_PATH ON)

    set(CPACK_NSIS_MUI_ICON "${CMAKE_SOURCE_DIR}/assets/logo.ico")
    set(CPACK_NSIS_MUI_UNIICON "${CMAKE_SOURCE_DIR}/assets/logo.ico")

    set(CPACK_NSIS_MENU_LINKS "TheHQProject" "TheHQProject")

    set(CPACK_NSIS_CREATE_ICONS_EXTRA
        "CreateShortCut \\\"$DESKTOP\\\\TheHQProject.lnk\\\" \\\"$INSTDIR\\\\TheHQProject.exe\\\"")
    set(CPACK_NSIS_DELETE_ICONS_EXTRA
        "Delete \\\"$DESKTOP\\\\TheHQProject.lnk\\\"")
elseif(APPLE)
    set(CPACK_GENERATOR "DragNDrop")
    set(CPACK_DMG_VOLUME_NAME "TheHQProject")

else()
    set(CPACK_GENERATOR "TGZ")
endif()

include(CPack)