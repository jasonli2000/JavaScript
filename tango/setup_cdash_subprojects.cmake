set(CTEST_SITE "localhost")
set(CTEST_BUILD_NAME "Linux Ubuntu 12.04")

set(CTEST_DASHBOARD_ROOT "/projects/redwood_ws")
set(CTEST_SOURCE_DIRECTORY "${CTEST_DASHBOARD_ROOT}/RedwoodInternal/Redwood")
set(CTEST_BINARY_DIRECTORY "${CTEST_DASHBOARD_ROOT}/build_linux")

ctest_start(Experimental)
ctest_submit(FILES "${CTEST_DASHBOARD_ROOT}/Project.xml")
