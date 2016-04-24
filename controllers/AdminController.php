<?php

use Pimcore\Model\Object;

class ESBackendSearch_AdminController extends \Pimcore\Controller\Action\Admin {


    public function getFieldsAction() {

        $classId = intval($this->getParam("class_id"));

        $service = new \ESBackendSearch\Service();
        $fieldSelectionInformationEntries = $service->getFieldSelectionInformationForClassDefinition(\Pimcore\Model\Object\ClassDefinition::getById($classId));

        $fields = [];
        foreach($fieldSelectionInformationEntries as $entry) {
            $fields[] = $entry->toArray();
        }

        $this->_helper->json(['data' => $fields]);
    }


    public function filterAction() {
        $service = new ESBackendSearch\Service();

        $data = json_decode($this->getParam("filter"), true);

        $results = $service->doFilter($data['classId'], $data['conditions']['filters'], $data['conditions']['fulltextSearchTerm']);

        p_r($results); die();

    }

    public function gridProxyAction() {
        $requestedLanguage = $this->getParam("language");
        if ($requestedLanguage) {
            if ($requestedLanguage != "default") {
                $this->setLanguage($requestedLanguage, true);
            }
        } else {
            $requestedLanguage = $this->getLanguage();
        }

        if ($this->getParam("data")) {
            $this->forward("grid-proxy", "object", "admin");
        } else {

            // get list of objects
            $class = Object\ClassDefinition::getById($this->getParam("classId"));
            $className = $class->getName();

            $fields = array();
            if ($this->getParam("fields")) {
                $fields = $this->getParam("fields");
            }

            $start = 0;
            $limit = 20;
            if ($this->getParam("limit")) {
                $limit = $this->getParam("limit");
            }
            if ($this->getParam("start")) {
                $start = $this->getParam("start");
            }

            $listClass = "\\Pimcore\\Model\\Object\\" . ucfirst($className) . "\\Listing";


            //get ID list from ES Service
            $service = new ESBackendSearch\Service($this->getUser());
            $data = json_decode($this->getParam("filter"), true);
            $results = $service->doFilter($data['classId'], $data['conditions']['filters'], $data['conditions']['fulltextSearchTerm'], $start, $limit);

            $total = $service->extractTotalCountFromResult($results);
            $ids = $service->extractIdsFromResult($results);

            /**
             * @var $list \Pimcore\Model\Object\Listing
             */
            $list = new $listClass();

            if(!empty($ids)) {
                $list->setCondition("o_id IN (" . implode(",", $ids) . ")");
                $list->setOrderKey(" FIELD(o_id, " . implode(",", $ids) . ")", false);
            } else {
                $list->setCondition("1=2");
            }

            $list->load();

            $objects = array();
            foreach ($list->getObjects() as $object) {
                $o = Object\Service::gridObjectData($object, $fields, $requestedLanguage);
                $objects[] = $o;
            }
            $this->_helper->json(array("data" => $objects, "success" => true, "total" => $total));

        }
    }


}