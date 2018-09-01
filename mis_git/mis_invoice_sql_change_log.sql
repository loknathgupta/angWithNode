-- added by sumana on 17-May-2018
DROP TABLE IF EXISTS `slab_price`;
CREATE TABLE IF NOT EXISTS `slab_price` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `price_master_id` int(11) NOT NULL,
  `volume_from` int(5) NOT NULL,
  `volume_to` int(5) NOT NULL,
  `price` float(10,2) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_by` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `price_master_id` (`price_master_id`)
);
ALTER TABLE `price_master` ADD `price_type` CHAR(2) NOT NULL DEFAULT 'F' AFTER `client_status`;

ALTER TABLE `monthly_invoice` CHANGE `invoice_number` `invoice_number` VARCHAR(100) NULL DEFAULT NULL;

# added by sumana on 18-May-2018
ALTER TABLE `user_role` CHANGE `reporting_manager_role_id` `reporting_manager_role_id` VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE `slab_price` CHANGE `volume_to` `volume_to` INT(5) NULL;


INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '14', '/invoice/updateInvoiceReport', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '0', '/invoice/viewSlabPrice', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');

# ------------------------------ uploaded on pvr.di.com ------------------------------------------


# added by Loknath on 25-May-2018
DROP TABLE IF EXISTS `user_role_access`;
CREATE TABLE IF NOT EXISTS `user_role_access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_by` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO user_role_access (user_id, role_id, created_by, modified_by, created, modified)
SELECT id, user_role_id, if(created_by IS NULL, 1, created_by) , if(modified_by IS NULL, 1, modified_by), if(created IS NULL, now(), created), if(modified IS NULL, now(), modified) FROM user where 1;
 ------------------------------ uploaded on pvr.di.com on 28-5-18------------------------------------------

# added by loknath on 29-5-18
DROP TABLE IF EXISTS `monthly_volume_sheet`;
CREATE TABLE IF NOT EXISTS `monthly_volume_sheet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `price_master_id` int(11) NOT NULL,
  `volume_sheet` varchar(255) NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `modified_by` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `sheet_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);
ALTER TABLE `custom_price_master` CHANGE `account_manager_id` `account_manager_id` INT(11) NULL DEFAULT NULL;
ALTER TABLE `custom_price_master_audit` CHANGE `account_manager_id` `account_manager_id` INT(11) NULL DEFAULT NULL;
------------------------------ uploaded on pvr.di.com on 30-5-18------------------------------------------

ALTER TABLE `price_master` CHANGE `price_per_unit` `price_per_unit` FLOAT(10,3) NOT NULL;
ALTER TABLE `custom_price_master` CHANGE `price_per_unit` `price_per_unit` FLOAT(10,3) NOT NULL;
ALTER TABLE `custom_price_master_audit` CHANGE `price_per_unit` `price_per_unit` FLOAT(10,3) NOT NULL;
ALTER TABLE `price_master_audit` CHANGE `price_per_unit` `price_per_unit` FLOAT(10,3) NOT NULL;
ALTER TABLE `slab_price` CHANGE `price` `price` FLOAT(10,3) NOT NULL;
------------------------------ uploaded on pvr.di.com on 30-5-18------------------------------------------
# Added by loknath on 2-6-18
ALTER TABLE `price_master` ADD `approval_status` CHAR(2) NOT NULL DEFAULT 'N' COMMENT '\'N\':No, \'Y\': Yes' AFTER `status`;
ALTER TABLE `daily_deliverable` CHANGE `volume` `volume` FLOAT(10,2) NOT NULL;
ALTER TABLE `daily_deliverable_audit` CHANGE `volume` `volume` FLOAT(10,2) NOT NULL;
ALTER TABLE `monthly_volume` CHANGE `volume` `volume` FLOAT(10,2) NOT NULL;
ALTER TABLE `monthly_volume_audit` CHANGE `volume` `volume` FLOAT(10,2) NOT NULL;
ALTER TABLE `custom_price_master` CHANGE `volume` `volume` FLOAT(10,2) NOT NULL;
ALTER TABLE `custom_price_master_audit` CHANGE `volume` `volume` FLOAT(10,2) NOT NULL;
ALTER TABLE `daily_deliverable_change_req` CHANGE `volume` `volume` FLOAT(10,2) NOT NULL;

# added by loknath on 5-6-18
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '8', '/change_approval/get_custom_price', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
ALTER TABLE `slab_price` ADD `commited_minimum_amt` FLOAT(10,3) NULL AFTER `price`;
#------------------------ uploaded on pvr.di.com on 5-6-18----------

INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES (NULL, '6', '/price/all_price_heads', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
#------------------------ uploaded on pvr.di.com on 8-6-18----------

ALTER TABLE `monthly_invoice` ADD `price_head_type` VARCHAR(2) NOT NULL DEFAULT 'S' COMMENT '\'S\' => Standard, \'C\' => Custom' AFTER `price_master_id`;
#------------------------ uploaded on pvr.di.com on 8-6-18----------

INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '7', '/delivery/save_mtd_file', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '7', '/delivery/delete_mtd_file', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '7', '/delivery/suspend_price_head', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '8', '/change_approval/suspended_price_head', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '8', '/change_approval/activate_suspended_heads', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');||||||| .r289
ALTER TABLE `monthly_invoice` ADD `price_head_type` VARCHAR(2) NOT NULL DEFAULT 'N' COMMENT '\'S\':Standard, \'Y\': Yes' AFTER `price_master_id`;=======
ALTER TABLE `monthly_invoice` ADD `price_head_type` VARCHAR(2) NOT NULL DEFAULT 'N' COMMENT '\'S\':Standard, \'Y\': Yes' AFTER `price_master_id`;

# added by sumana on 11-Jun-2018
INSERT INTO `misclient-dev`.`module` (`id`, `parent_id`, `module_name`, `router`, `sort_order`, `icon`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('18', '4', 'Revenue Report Summary', '/invoice/revenueByClient', '10', NULL, '2018-05-04 00:00:00', '2018-05-04 00:00:00', '0', '0');
UPDATE `module` SET `sort_order` = '7' WHERE `module`.`id` = 15;
UPDATE `module` SET `sort_order` = '10' WHERE `module`.`id` = 18;

INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '18', '/invoice/revenueByClientData', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');

#------------------------ uploaded on pvr.di.com on 11-6-18----------

# added by sumana on 13-June-2018
UPDATE `module` SET `module_name` = 'Projected vs Actual Volume & Price Report' WHERE `module`.`id` = 11;
INSERT INTO `module` (`id`, `parent_id`, `module_name`, `router`, `sort_order`, `icon`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '4', 'Projected vs Actual Volume Report', '/report/projected_volume', '6', NULL, '2018-05-04 00:00:00', '2018-05-04 00:00:00', '0', '0'); 
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '19', '/report/getMonthlyData', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');

#------------------------ uploaded on pvr.di.com ----------

# added by sumana on 22-June-2018
ALTER TABLE `custom_price_master` ADD `requested` DATE NULL AFTER `approval_comment`;
ALTER TABLE `custom_price_master_audit` ADD `approval_comment` VARCHAR(1000) NULL AFTER `audit_timestamp`;
ALTER TABLE `custom_price_master_audit` ADD `requested` DATE NULL AFTER `approval_comment`;

Delimiter//
DROP TRIGGER IF EXISTS `customPriceAuditUpdate`//
CREATE  TRIGGER `customPriceAuditUpdate` AFTER UPDATE ON `custom_price_master` FOR EACH ROW BEGIN
 INSERT INTO custom_price_master_audit(`id`, `price_master_id`, `i_clientid`, i_empid , account_manager_id , `invoice_item`, `price_per_unit`, `currency`, `description`, `price_unit`, `volume`, `status`, `start_date`, `end_date`, `created`, `modified`, `created_by`,  `modified_by`,`approval_comment`,`requested`, `audit_insert_type`,  `audit_timestamp`)
    VALUES (OLD.`id`, OLD.`price_master_id`, OLD.`i_clientid`,  OLD.i_empid , OLD.account_manager_id , OLD.`invoice_item`, OLD.`price_per_unit`, OLD.`currency`, OLD.`description`, OLD.`price_unit`, OLD.`volume`, OLD.`status`, OLD.`start_date`, OLD.`end_date`, OLD.`created`, OLD.`modified`, OLD.`created_by`,  OLD.`modified_by`,OLD.`approval_comment`,OLD.`requested`,'Updated', now());
END //

Delimiter ;

# added by loknath on 3-7-18
INSERT INTO `module` (`id`, `parent_id`, `module_name`, `router`, `sort_order`, `icon`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '4', 'Projected vs Actual Amount', '/report/amount_report', '7', NULL, '2018-05-04 00:00:00', '2018-05-04 00:00:00', '0', '0');
UPDATE `module` SET `module_name` = 'Projected vs Actual Volume & Price' WHERE `module_name` = 'Projected vs Actual Volume & Price Report';
UPDATE `module` SET `module_name` = 'Projected vs Actual Volume' WHERE `module_name` = 'Projected vs Actual Volume Report';
UPDATE `module` SET `module_name` = 'Revenue' WHERE `module_name` = 'Revenue Report';
UPDATE `module` SET `module_name` = 'Revenue Summary' WHERE `module_name` = 'Revenue Report Summary';
ALTER TABLE `user` ADD COLUMN `employee_code` VARCHAR(100) NOT NULL;

INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES (NULL, '0', '/delivery/upload_file', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');

INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES (NULL, '0', '/delivery/save_mtd_file', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES (NULL, '0', '/delivery/download_mtd_file', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');
INSERT INTO `module_sub_pages` (`id`, `module_id`, `router`, `created`, `modified`, `created_by`, `modified_by`) VALUES (NULL, '0', '/delivery/delete_mtd_file', '2018-05-09 00:00:00', '2018-05-09 00:00:00', '0', '0');

# added by loknath on 3-8-18 
ALTER TABLE `monthly_volume_sheet` ADD `is_custom_price` INT NULL DEFAULT '0' AFTER `sheet_name`;

# added by sumana on 29-Aug-2018
INSERT INTO `module` (`id`, `parent_id`, `module_name`, `router`, `sort_order`, `icon`, `created`, `modified`, `created_by`, `modified_by`) VALUES ('0', '4', 'Revenue Summary by Days', '/invoice/revenueByClientDays', '11', NULL, '2018-05-04 00:00:00', '2018-05-04 00:00:00', '0', '0');
