import xml.etree.ElementTree as ET


xmlFile = "Project.xml"

subProjLst = []
subProjSet = {}
subProjDep = {}

def generateDepMatrixByXML(xmlFile):

  xmlTree = ET.parse(xmlFile)
  rootElem = xmlTree.getroot()
  for children in rootElem:
    print children.tag, children.attrib
    projName = children.attrib['name']
    print projName
    subProjLst.append(projName)
    subProjSet[projName] = len(subProjLst) - 1
    for child in children:
      print "\t", child.tag, child.attrib
      depName = child.attrib['name']
      subProjDep.setdefault(projName, []).append(depName)

  for key, value in subProjDep.iteritems():
    if key not in subProjSet:
      print "Error, key %s not found" % key
      for dep in value:
        if dep not in subProjSet:
          print "Error, dep %s is not a valid project" % dep

  # now convert to json format

  # find out all nodes set (get rid of isolated projects)
  allDepProj = set(subProjDep.keys()) | reduce(set.union, subProjDep.values(), set())
  print len(allDepProj), len(subProjLst)

def outputDepMatrixToJSON(output, formatStr):
  import json
  jsonDump = {}
  if formatStr == "co-occurence":
    for subproj in subProjLst:
      nodeInfo = {'name': subproj, 'group': 1}
      jsonDump.setdefault('nodes', []).append(nodeInfo)
      if subproj in subProjDep:
        sourceIdx = subProjSet[subproj]
        for dep in subProjDep[subproj]:
          depInfo = {'source': sourceIdx,
                     'target': subProjSet[dep],
                     'value': 1
                    }
          jsonDump.setdefault('links',[]).append(depInfo)
    json.dump(jsonDump, open(output, "wb"))
  elif formatStr == "dependencywheel":
    outputJs = open(output, "wb")
    outputJs.write('var data = {\n')
    outputJs.write('package: %s,\n' % subProjLst)
    # generate the matrix
    outputJs.write('matrix: [\n')
    for depList in subProjDep.itervalues():
      defaultLst = [0] * len(subProjLst)
      for dep in depList:
        defaultLst[subProjSet[dep]] = 1
      outputJs.write('%s,\n' % defaultLst)
    outputJs.write('];\n')
    outputJs.write('};\n')


generateDepMatrixByXML(xmlFile)
outputDepMatrixToJSON("depwheel.js", 'dependencywheel')

